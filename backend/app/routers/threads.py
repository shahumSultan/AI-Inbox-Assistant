import json
import os
from datetime import date
from typing import Any

import anthropic
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, require_active
from app.models import Action, ConversationThread, User
from app.prompts.analysis import ANALYSIS_PROMPT, SYSTEM_PROMPT
from app.schemas.thread import AnalyseRequest, ThreadOut

router = APIRouter(prefix="/api/threads", tags=["threads"])


def _call_claude(raw_text: str) -> dict[str, Any]:
    client = anthropic.Anthropic(api_key=os.environ["LLM_API_KEY"])
    model = os.getenv("LLM_MODEL_ANALYSIS", "claude-sonnet-4-6")

    message = client.messages.create(
        model=model,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": ANALYSIS_PROMPT.format(thread_text=raw_text)}],
    )

    text = message.content[0].text.strip()
    # Strip markdown fences if model adds them despite instructions
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)


@router.post("/analyse", response_model=ThreadOut, status_code=201)
def analyse_thread(
    body: AnalyseRequest,
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    if not os.getenv("LLM_API_KEY"):
        raise HTTPException(503, "LLM_API_KEY not configured")

    try:
        result = _call_claude(body.raw_text)
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
