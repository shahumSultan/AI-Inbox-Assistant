import os
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.security import decrypt_field, encrypt_field
from app.deps import get_db, require_active
from app.models import OAuthConnection, User
from app.schemas.oauth import ConnectUrlResponse, OAuthConnectionOut, SyncResult
from app.services.email_sync import sync_all_connections

router = APIRouter(prefix="/api/oauth", tags=["oauth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

MICROSOFT_AUTH_BASE = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0"


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000")


# ── Google ───────────────────────────────────────────────────────────────────

@router.get("/google/connect", response_model=ConnectUrlResponse)
def google_connect(user: User = Depends(require_active)):
    params = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI", ""),
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email",
        "access_type": "offline",
        "prompt": "consent",  # always request refresh_token
        "state": str(user.id),
    }
    return ConnectUrlResponse(url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/google/callback")
def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    # Exchange code for tokens
    token_resp = httpx.post(GOOGLE_TOKEN_URL, data={
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI", ""),
        "grant_type": "authorization_code",
    })
    if not token_resp.is_success:
        return RedirectResponse(f"{_frontend_url()}/settings?oauth_error=google_token_failed")

    data = token_resp.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    if not refresh_token:
        return RedirectResponse(f"{_frontend_url()}/settings?oauth_error=no_refresh_token")

    # Fetch the connected email address
    userinfo = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
    ).json()
    email_address = userinfo.get("email", "")

    from datetime import datetime, timedelta, timezone
    expiry = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600))

    # Upsert — same user + provider + email updates tokens
    existing = db.query(OAuthConnection).filter(
        OAuthConnection.user_id == state,
        OAuthConnection.provider == "google",
        OAuthConnection.email_address == email_address,
    ).first()

    if existing:
        existing.access_token = encrypt_field(access_token)
        existing.refresh_token = encrypt_field(refresh_token)
        existing.token_expiry = expiry
    else:
        db.add(OAuthConnection(
            user_id=state,
            provider="google",
            email_address=email_address,
            access_token=encrypt_field(access_token),
            refresh_token=encrypt_field(refresh_token),
            token_expiry=expiry,
        ))
    db.commit()

    return RedirectResponse(f"{_frontend_url()}/settings?oauth_success=google")


# ── Microsoft ────────────────────────────────────────────────────────────────

@router.get("/microsoft/connect", response_model=ConnectUrlResponse)
def microsoft_connect(user: User = Depends(require_active)):
    tenant = os.getenv("MICROSOFT_TENANT_ID", "common")
    params = {
        "client_id": os.getenv("MICROSOFT_CLIENT_ID", ""),
        "redirect_uri": os.getenv("MICROSOFT_REDIRECT_URI", ""),
        "response_type": "code",
        "scope": "https://graph.microsoft.com/Mail.Read offline_access",
        "response_mode": "query",
        "state": str(user.id),
    }
    auth_url = f"{MICROSOFT_AUTH_BASE.format(tenant=tenant)}/authorize"
    return ConnectUrlResponse(url=f"{auth_url}?{urlencode(params)}")


@router.get("/microsoft/callback")
def microsoft_callback(code: str, state: str, db: Session = Depends(get_db)):
    tenant = os.getenv("MICROSOFT_TENANT_ID", "common")
    token_url = f"{MICROSOFT_AUTH_BASE.format(tenant=tenant)}/token"

    token_resp = httpx.post(token_url, data={
        "code": code,
        "client_id": os.getenv("MICROSOFT_CLIENT_ID", ""),
        "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET", ""),
        "redirect_uri": os.getenv("MICROSOFT_REDIRECT_URI", ""),
        "grant_type": "authorization_code",
        "scope": "https://graph.microsoft.com/Mail.Read offline_access",
    })
    if not token_resp.is_success:
        return RedirectResponse(f"{_frontend_url()}/settings?oauth_error=microsoft_token_failed")

    data = token_resp.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    if not refresh_token:
        return RedirectResponse(f"{_frontend_url()}/settings?oauth_error=no_refresh_token")

    # Fetch connected email from Graph /me
    me_resp = httpx.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    email_address = me_resp.json().get("mail") or me_resp.json().get("userPrincipalName", "")

    from datetime import datetime, timedelta, timezone
    expiry = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600))

    existing = db.query(OAuthConnection).filter(
        OAuthConnection.user_id == state,
        OAuthConnection.provider == "microsoft",
        OAuthConnection.email_address == email_address,
    ).first()

    if existing:
        existing.access_token = encrypt_field(access_token)
        existing.refresh_token = encrypt_field(refresh_token)
        existing.token_expiry = expiry
    else:
        db.add(OAuthConnection(
            user_id=state,
            provider="microsoft",
            email_address=email_address,
            access_token=encrypt_field(access_token),
            refresh_token=encrypt_field(refresh_token),
            token_expiry=expiry,
        ))
    db.commit()

    return RedirectResponse(f"{_frontend_url()}/settings?oauth_success=microsoft")


# ── Connection management ────────────────────────────────────────────────────

@router.get("/connections", response_model=list[OAuthConnectionOut])
def list_connections(user: User = Depends(require_active), db: Session = Depends(get_db)):
    return db.query(OAuthConnection).filter(OAuthConnection.user_id == user.id).all()


@router.delete("/connections/{connection_id}", status_code=204)
def disconnect(
    connection_id: str,
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    conn = db.query(OAuthConnection).filter(
        OAuthConnection.id == connection_id,
        OAuthConnection.user_id == user.id,
    ).first()
    if not conn:
        raise HTTPException(404, "Connection not found")
    db.delete(conn)
    db.commit()


# ── Sync trigger ─────────────────────────────────────────────────────────────

@router.post("/sync", response_model=SyncResult)
def trigger_sync(user: User = Depends(require_active), db: Session = Depends(get_db)):
    result = sync_all_connections(str(user.id), db)
    return SyncResult(**result)
