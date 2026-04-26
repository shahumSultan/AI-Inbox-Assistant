from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
import uuid


class AnalyseRequest(BaseModel):
    raw_text: str = Field(..., min_length=20, max_length=50000)


class ActionOut(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    suggested_next_step: str
    suggested_text: Optional[str]
    priority: int
    due_date: Optional[date]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ThreadOut(BaseModel):
    id: uuid.UUID
    title: str
    summary: str
    primary_intent: str
    priority_score: int
    confidence_score: float
    status: str
    source: str
    created_at: datetime
    actions: list[ActionOut] = []

    model_config = {"from_attributes": True}
