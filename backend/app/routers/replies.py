import json
import os
import re

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.security import decrypt_field
from app.deps import get_current_user, get_db, require_active
from app.models import ConversationThread, GeneratedReply, User
from app.prompts.reply import REPLY_SYSTEM_PROMPT, REPLY_USER_PROMPT
from app.schemas.reply import GenerateReplyRequest, GenerateReplyResponse, ReplyDraft, SavedReplyOut

router = APIRouter(prefix="/api/replies", tags=["replies"])

VALID_GOALS = {"close_deal", "clarify", "follow_up", "decline", "negotiate", "apologize"}
VALID_TONES = {"professional", "friendly", "assertive", "concise"}


def _get_client_and_model(user: User) -> tuple[OpenAI, str]:
    if user.openai_api_key:
        try:
            key = decrypt_field(user.openai_api_key)
            return OpenAI(api_key=key), "gpt-4o-mini"
        except Exception:
            pass

    if user.is_admin:
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            return (
                OpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1"),
                os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            )

    raise HTTPException(
        503,
        "No AI provider configured. Please add your OpenAI API key in Settings → AI.",
    )


@router.post("/generate", response_model=GenerateReplyResponse)
def generate_reply(
    body: GenerateReplyRequest,
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.id == body.thread_id, ConversationThread.user_id == user.id)
        .first()
    )
    if not thread:
        raise HTTPException(404, "Thread not found")

    goal = body.goal if body.goal in VALID_GOALS else "clarify"
    tone = body.tone if body.tone in VALID_TONES else "professional"
    effective_tone = tone if body.tone else (user.default_tone or "professional")

    signature_line = f"Signature to append: {user.signature}" if user.signature else ""
    extra_line = f"Extra instruction: {body.extra_instruction}" if body.extra_instruction else ""

    prompt = (
        REPLY_USER_PROMPT
        .replace("{summary}", thread.summary or "")
        .replace("{primary_intent}", thread.primary_intent or "")
        .replace("{goal}", goal)
        .replace("{tone}", effective_tone)
        .replace("{signature_line}", signature_line)
        .replace("{extra_line}", extra_line)
        .replace("{raw_text}", thread.raw_text)
        .replace("{signature_placeholder}", user.signature or "")
    )

    client, model = _get_client_and_model(user)
    try:
        response = client.chat.completions.create(
            model=model,
            max_tokens=2048,
            messages=[
                {"role": "system", "content": REPLY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"LLM call failed: {e}")

    content = response.choices[0].message.content
    if not content:
        raise HTTPException(502, "Model returned empty response")

    match = re.search(r"\[[\s\S]*\]", content)
    if not match:
        raise HTTPException(502, "Model did not return a JSON array")

    try:
        raw_drafts = json.loads(match.group())
    except json.JSONDecodeError as e:
        raise HTTPException(502, f"LLM returned invalid JSON: {e}")

    drafts = [
        ReplyDraft(
            label=d.get("label", f"Draft {i+1}"),
            text=d.get("text", ""),
            reason=d.get("reason", ""),
        )
        for i, d in enumerate(raw_drafts[:3])
    ]

    # Persist the first draft
    if drafts:
        existing_count = db.query(GeneratedReply).filter(
            GeneratedReply.thread_id == thread.id,
            GeneratedReply.user_id == user.id,
        ).count()
        db.add(GeneratedReply(
            thread_id=thread.id,
            user_id=user.id,
            goal=goal,
            tone=effective_tone,
            reply_text=drafts[0].text,
            version=existing_count + 1,
        ))
        db.commit()

    return GenerateReplyResponse(thread_id=thread.id, replies=drafts)


@router.get("/{thread_id}", response_model=list[SavedReplyOut])
def list_replies(
    thread_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.id == thread_id, ConversationThread.user_id == user.id)
        .first()
    )
    if not thread:
        raise HTTPException(404, "Thread not found")
    return (
        db.query(GeneratedReply)
        .filter(GeneratedReply.thread_id == thread_id, GeneratedReply.user_id == user.id)
        .order_by(GeneratedReply.created_at.desc())
        .all()
    )
