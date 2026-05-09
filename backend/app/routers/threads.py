import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db, require_active
from app.models import ConversationThread, User
from app.schemas.thread import AnalyseRequest, ThreadOut
from app.services.analysis import call_ai, persist_thread

router = APIRouter(prefix="/api/threads", tags=["threads"])


@router.post("/analyse", response_model=ThreadOut, status_code=201)
def analyse_thread(
    body: AnalyseRequest,
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    try:
        result = call_ai(body.raw_text, user)
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise HTTPException(502, f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(502, f"LLM call failed: {e}")

    return persist_thread(body.raw_text, result, user, db, source="paste")


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
