from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime


class GenerateReplyRequest(BaseModel):
    thread_id: uuid.UUID
    goal: str = "clarify"
    tone: str = "professional"
    extra_instruction: Optional[str] = None


class ReplyDraft(BaseModel):
    label: str
    text: str
    reason: str


class GenerateReplyResponse(BaseModel):
    thread_id: uuid.UUID
    replies: list[ReplyDraft]


class SavedReplyOut(BaseModel):
    id: uuid.UUID
    thread_id: uuid.UUID
    goal: str
    tone: str
    reply_text: str
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}
