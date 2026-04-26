from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Action, User
from app.schemas.action import ActionUpdate
from app.schemas.thread import ActionOut

router = APIRouter(prefix="/api/actions", tags=["actions"])


@router.patch("/{action_id}", response_model=ActionOut)
def update_action(
    action_id: str,
    body: ActionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    action = (
        db.query(Action)
        .filter(Action.id == action_id, Action.user_id == user.id)
        .first()
    )
    if not action:
        raise HTTPException(404, "Action not found")

    if body.status is not None:
        action.status = body.status

    db.commit()
    db.refresh(action)
    return action
