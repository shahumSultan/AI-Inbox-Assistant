import json
import os
import re
from datetime import date
from typing import Any

from fastapi import HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.security import decrypt_field
from app.models import Action, ConversationThread, User
from app.prompts.analysis import ANALYSIS_PROMPT, SYSTEM_PROMPT


def get_client_and_model(user: User) -> tuple[OpenAI, str]:
    # 1. User's own Groq key
    if user.groq_api_key:
        try:
            key = decrypt_field(user.groq_api_key)
            return (
                OpenAI(api_key=key, base_url="https://api.groq.com/openai/v1"),
                os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            )
        except Exception:
            pass

    # 2. User's own OpenAI key
    if user.openai_api_key:
        try:
            key = decrypt_field(user.openai_api_key)
            return OpenAI(api_key=key), "gpt-4o-mini"
        except Exception:
            pass

    # 3. Server-level Groq fallback (env var)
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        return (
            OpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1"),
            os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        )

    raise HTTPException(
        503,
        "No AI provider configured. Add a Groq or OpenAI API key in Settings → AI.",
    )


def call_ai(raw_text: str, user: User) -> dict[str, Any]:
    client, model = get_client_and_model(user)

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

    match = re.search(r"\{[\s\S]*\}", content)
    if not match:
        raise ValueError(f"No JSON object found in model response: {content[:200]}")
    return json.loads(match.group())


def persist_thread(
    raw_text: str,
    result: dict[str, Any],
    user: User,
    db: Session,
    source: str = "paste",
    external_id: str | None = None,
) -> ConversationThread:
    thread = ConversationThread(
        user_id=user.id,
        raw_text=raw_text,
        source=source,
        external_id=external_id,
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
