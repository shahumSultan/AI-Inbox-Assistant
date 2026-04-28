from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.deps import get_db, require_active
from app.models import ConversationThread, User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class DashboardThread(BaseModel):
    id: str
    title: str
    summary: str
    primary_intent: str
    priority_score: int
    status: str
    open_action_count: int
    top_action_type: Optional[str]
    earliest_due: Optional[date]
    created_at: datetime


class DashboardGroup(BaseModel):
    key: str
    label: str
    color: str
    threads: list[DashboardThread]


class DashboardOut(BaseModel):
    groups: list[DashboardGroup]
    total: int


def _bucket(thread: ConversationThread, today: date) -> str:
    open_actions = [a for a in thread.actions if a.status == "open"]
    due_dates = [a.due_date for a in open_actions if a.due_date]
    earliest = min(due_dates) if due_dates else None

    if (thread.priority_score or 0) >= 4 and open_actions:
        return "reply_now"
    if earliest and earliest <= today:
        return "follow_up_today"
    if thread.status == "waiting" or not open_actions:
        return "waiting"
    return "low_priority"


@router.get("", response_model=DashboardOut)
def get_dashboard(
    user: User = Depends(require_active),
    db: Session = Depends(get_db),
):
    threads = (
        db.query(ConversationThread)
        .filter(
            ConversationThread.user_id == user.id,
            ConversationThread.status.in_(["active", "waiting"]),
        )
        .order_by(ConversationThread.priority_score.desc(), ConversationThread.created_at.desc())
        .all()
    )

    today = date.today()
    buckets: dict[str, list[DashboardThread]] = {
        "reply_now": [], "follow_up_today": [], "waiting": [], "low_priority": [],
    }

    for thread in threads:
        open_actions = [a for a in thread.actions if a.status == "open"]
        due_dates = [a.due_date for a in open_actions if a.due_date]

        item = DashboardThread(
            id=str(thread.id),
            title=thread.title,
            summary=thread.summary or "",
            primary_intent=thread.primary_intent or "",
            priority_score=thread.priority_score or 3,
            status=thread.status,
            open_action_count=len(open_actions),
            top_action_type=open_actions[0].type if open_actions else None,
            earliest_due=min(due_dates) if due_dates else None,
            created_at=thread.created_at,
        )
        buckets[_bucket(thread, today)].append(item)

    groups = [
        DashboardGroup(key="reply_now",       label="Reply Now",        color="#ef4444", threads=buckets["reply_now"]),
        DashboardGroup(key="follow_up_today", label="Follow Up Today",  color="#f59e0b", threads=buckets["follow_up_today"]),
        DashboardGroup(key="waiting",         label="Waiting",          color="#06b6d4", threads=buckets["waiting"]),
        DashboardGroup(key="low_priority",    label="Low Priority",     color="#64748b", threads=buckets["low_priority"]),
    ]

    return DashboardOut(groups=groups, total=sum(len(g.threads) for g in groups))
