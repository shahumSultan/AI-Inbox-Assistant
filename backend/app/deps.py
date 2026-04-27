from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import SessionLocal
from .core.security import decode_token
from .models import User

_bearer = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    user_id = decode_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_active(user: User = Depends(get_current_user)) -> User:
    """Blocks access if trial expired and user hasn't upgraded. Admins always pass."""
    if user.is_admin:
        return user
    if user.plan in ("pro", "team"):
        return user
    # Free plan — check trial window
    if user.trial_ends_at is None:
        return user  # legacy row with no trial set yet
    if user.trial_ends_at > datetime.now(timezone.utc):
        return user
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="Your 14-day trial has expired. Please upgrade to continue.",
    )
