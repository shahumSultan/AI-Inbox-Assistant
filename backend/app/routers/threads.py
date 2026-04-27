import json
import os
import re
from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.security import decrypt_field
from app.deps import get_current_user, get_db, require_active
from app.models import Action, ConversationThread, User
from app.prompts.analysis import ANALYSIS_PROMPT, SYSTEM_PROMPT
from app.schemas.thread import AnalyseRequest, ThreadOut

router = APIRouter(prefix="/api/threads", tags=["threads"])


def _get_client_and_model(user: User) -> tuple[OpenAI, str]:
    """Return (OpenAI client, model name) based on user config and admin fallback."""
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


def _call_ai(raw_text: str, user: User) -> dict[str, Any]:
    client, model = _get_client_and_model(user)

    response = client.chat.completions.create(
        model=model,
        max_tokens=2048,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": ANALYSIS_PROMPT.replace("{thread_text}", raw_text)},
        ],
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("Model returned empty response")

    # Extract JSON object — handles markdown fences, leading text, etc.
    match = re.search(r"\{[\s\S]*\}", content)
    if not match:
        raise ValueError(f"No JSON object found in model response: {content[:200]}")
    return json.loads(match.group())


@router.post("/analyse", response_model=ThreadOut, status_code=201)
def analyse_thread(
    body: AnalyseRequest,
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    try:
        result = _call_ai(body.raw_text, user)
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise HTTPException(502, f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(502, f"LLM call failed: {e}")

    thread = ConversationThread(
        user_id=user.id,
        raw_text=body.raw_text,
        source="paste",
        title=result.get("title", "Untitled Thread")[:255],
        summary=result.get("summary", ""),
        primary_intent=result.get("primary_intent", ""),
        priority_score=max(1, min(5, int(result.get("priority_score", 3)))),
        confidence_score=max(0.0, min(1.0, float(result.get("confidence_score", 0.5)))),
        status="active",
    )
    db.add(thread)
    db.flush()

    for raw_action in result.get("actions", []):
        due_raw = raw_action.get("due_date")
        due = None
        if due_raw:
            try:
                due = date.fromisoformat(str(due_raw)[:10])
            except ValueError:
                pass

        action = Action(
            thread_id=thread.id,
            user_id=user.id,
            type=raw_action.get("type", "task"),
            title=raw_action.get("title", "Action")[:255],
            suggested_next_step=raw_action.get("suggested_next_step", ""),
            suggested_text=raw_action.get("suggested_text"),
            priority=max(1, min(5, int(raw_action.get("priority", 3)))),
            due_date=due,
            status="open",
        )
        db.add(action)

    db.commit()
    db.refresh(thread)
    return thread


@router.get("", response_model=list[ThreadOut])
def list_threads(
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    return (
        db.query(ConversationThread)
        .filter(ConversationThread.user_id == user.id)
        .order_by(ConversationThread.created_at.desc())
        .all()
    )


@router.get("/{thread_id}", response_model=ThreadOut)
def get_thread(
    thread_id: str,
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.id == thread_id, ConversationThread.user_id == user.id)
        .first()
    )
    if not thread:
        raise HTTPException(404, "Thread not found")
    return thread
