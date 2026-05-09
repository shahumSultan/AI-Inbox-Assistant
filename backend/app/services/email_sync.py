import base64
import html
import logging
import os
import re
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session

log = logging.getLogger(__name__)

from app.core.security import decrypt_field, encrypt_field
from app.models import ConversationThread, OAuthConnection, User
from app.services.analysis import call_ai, persist_thread

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"


# ── Token management ────────────────────────────────────────────────────────

def _refresh_google_token(connection: OAuthConnection, db: Session) -> str:
    refresh_token = decrypt_field(connection.refresh_token)
    resp = httpx.post(GOOGLE_TOKEN_URL, data={
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    })
    resp.raise_for_status()
    data = resp.json()
    new_access = data["access_token"]
    connection.access_token = encrypt_field(new_access)
    connection.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600))
    db.commit()
    return new_access


def _refresh_microsoft_token(connection: OAuthConnection, db: Session) -> str:
    tenant = os.getenv("MICROSOFT_TENANT_ID", "common")
    refresh_token = decrypt_field(connection.refresh_token)
    resp = httpx.post(
        MICROSOFT_TOKEN_URL.format(tenant=tenant),
        data={
            "client_id": os.getenv("MICROSOFT_CLIENT_ID"),
            "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET"),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": "https://graph.microsoft.com/Mail.Read offline_access",
        },
    )
    resp.raise_for_status()
    data = resp.json()
    new_access = data["access_token"]
    connection.access_token = encrypt_field(new_access)
    if "refresh_token" in data:
        connection.refresh_token = encrypt_field(data["refresh_token"])
    connection.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600))
    db.commit()
    return new_access


def _get_valid_access_token(connection: OAuthConnection, db: Session) -> str:
    cutoff = datetime.now(timezone.utc) + timedelta(minutes=5)
    if connection.token_expiry and connection.token_expiry > cutoff:
        return decrypt_field(connection.access_token)
    if connection.provider == "google":
        return _refresh_google_token(connection, db)
    return _refresh_microsoft_token(connection, db)


# ── Gmail helpers ────────────────────────────────────────────────────────────

def _extract_gmail_body(payload: dict) -> str:
    mime = payload.get("mimeType", "")
    if mime == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
    for part in payload.get("parts", []):
        text = _extract_gmail_body(part)
        if text:
            return text
    return ""


def _format_gmail_thread(thread_data: dict) -> str:
    lines = []
    for msg in thread_data.get("messages", []):
        headers = {h["name"].lower(): h["value"] for h in msg.get("payload", {}).get("headers", [])}
        lines.append(f"From: {headers.get('from', 'Unknown')}")
        lines.append(f"To: {headers.get('to', '')}")
        lines.append(f"Date: {headers.get('date', '')}")
        lines.append(f"Subject: {headers.get('subject', '(no subject)')}")
        lines.append("")
        body = _extract_gmail_body(msg.get("payload", {}))
        lines.append(body.strip())
        lines.append("\n" + "-" * 40 + "\n")
    return "\n".join(lines)


def sync_gmail(connection: OAuthConnection, user: User, db: Session) -> tuple[int, int, int]:
    access_token = _get_valid_access_token(connection, db)
    headers = {"Authorization": f"Bearer {access_token}"}

    list_resp = httpx.get(
        "https://gmail.googleapis.com/gmail/v1/users/me/threads",
        params={"maxResults": 50},
        headers=headers,
    )
    list_resp.raise_for_status()
    threads_data = list_resp.json().get("threads", [])

    synced = skipped = errors = 0
    for t in threads_data:
        thread_id = t["id"]
        external_id = f"gmail:{thread_id}"

        existing = db.query(ConversationThread).filter(
            ConversationThread.user_id == user.id,
            ConversationThread.external_id == external_id,
        ).first()
        if existing:
            skipped += 1
            continue

        thread_resp = httpx.get(
            f"https://gmail.googleapis.com/gmail/v1/users/me/threads/{thread_id}",
            params={"format": "full"},
            headers=headers,
        )
        if not thread_resp.is_success:
            errors += 1
            continue

        raw_text = _format_gmail_thread(thread_resp.json())
        if len(raw_text.strip()) < 20:
            skipped += 1
            continue

        try:
            result = call_ai(raw_text, user)
            persist_thread(raw_text, result, user, db, source="gmail", external_id=external_id)
            synced += 1
        except Exception as exc:
            log.error("Gmail thread %s failed: %s", external_id, exc, exc_info=True)
            errors += 1

    connection.last_synced_at = datetime.now(timezone.utc)
    db.commit()
    return synced, skipped, errors


# ── Outlook helpers ──────────────────────────────────────────────────────────

def _strip_html(text: str) -> str:
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s{3,}", "\n\n", text)
    return text.strip()


def _format_outlook_thread(messages: list[dict]) -> str:
    lines = []
    for msg in sorted(messages, key=lambda m: m.get("receivedDateTime", "")):
        sender = msg.get("from", {}).get("emailAddress", {})
        recipients = msg.get("toRecipients", [])
        to_str = ", ".join(r["emailAddress"].get("address", "") for r in recipients)
        lines.append(f"From: {sender.get('name', '')} <{sender.get('address', '')}>")
        lines.append(f"To: {to_str}")
        lines.append(f"Date: {msg.get('receivedDateTime', '')}")
        lines.append(f"Subject: {msg.get('subject', '(no subject)')}")
        lines.append("")
        body_content = msg.get("body", {}).get("content", "")
        body_type = msg.get("body", {}).get("contentType", "text")
        if body_type == "html":
            body_content = _strip_html(body_content)
        lines.append(body_content.strip())
        lines.append("\n" + "-" * 40 + "\n")
    return "\n".join(lines)


def sync_outlook(connection: OAuthConnection, user: User, db: Session) -> tuple[int, int, int]:
    access_token = _get_valid_access_token(connection, db)
    headers = {"Authorization": f"Bearer {access_token}"}

    resp = httpx.get(
        "https://graph.microsoft.com/v1.0/me/messages",
        params={
            "$top": "50",
            "$select": "id,conversationId,subject,from,toRecipients,body,receivedDateTime",
            "$orderby": "receivedDateTime desc",
        },
        headers=headers,
    )
    resp.raise_for_status()
    messages = resp.json().get("value", [])

    grouped: dict[str, list] = defaultdict(list)
    for msg in messages:
        grouped[msg["conversationId"]].append(msg)

    synced = skipped = errors = 0
    for conv_id, msgs in grouped.items():
        external_id = f"outlook:{conv_id}"

        existing = db.query(ConversationThread).filter(
            ConversationThread.user_id == user.id,
            ConversationThread.external_id == external_id,
        ).first()
        if existing:
            skipped += 1
            continue

        raw_text = _format_outlook_thread(msgs)
        if len(raw_text.strip()) < 20:
            skipped += 1
            continue

        try:
            result = call_ai(raw_text, user)
            persist_thread(raw_text, result, user, db, source="outlook", external_id=external_id)
            synced += 1
        except Exception as exc:
            log.error("Outlook conv %s failed: %s", external_id, exc, exc_info=True)
            errors += 1

    connection.last_synced_at = datetime.now(timezone.utc)
    db.commit()
    return synced, skipped, errors


# ── Top-level dispatcher ─────────────────────────────────────────────────────

def sync_all_connections(user_id: str, db: Session) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"synced": 0, "skipped": 0, "errors": 0}

    connections = db.query(OAuthConnection).filter(OAuthConnection.user_id == user_id).all()
    total_synced = total_skipped = total_errors = 0

    for conn in connections:
        try:
            if conn.provider == "google":
                s, sk, e = sync_gmail(conn, user, db)
            else:
                s, sk, e = sync_outlook(conn, user, db)
            total_synced += s
            total_skipped += sk
            total_errors += e
        except Exception:
            total_errors += 1

    return {"synced": total_synced, "skipped": total_skipped, "errors": total_errors}
