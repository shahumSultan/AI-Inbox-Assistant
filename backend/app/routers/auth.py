import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import get_db, get_current_user
from ..models import User
from ..schemas.auth import RegisterRequest, LoginRequest, TokenResponse, MeResponse, UpdateMeRequest
from ..core.security import hash_password, verify_password, create_access_token, encrypt_field, decrypt_field

router = APIRouter(prefix="/api/auth", tags=["auth"])

TRIAL_DAYS = 14


def _is_admin_email(email: str) -> bool:
    admin = os.getenv("ADMIN_EMAIL", "")
    return email.lower() in [e.strip().lower() for e in admin.split(",") if e.strip()]


def _key_hint(user: User) -> str | None:
    if not user.openai_api_key:
        return None
    try:
        plain = decrypt_field(user.openai_api_key)
        return f"...{plain[-4:]}" if len(plain) >= 4 else "...****"
    except Exception:
        return None


def _token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        user_id=str(user.id),
        email=user.email,
        plan=user.plan,
        is_admin=user.is_admin,
        trial_ends_at=user.trial_ends_at,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    is_admin = _is_admin_email(body.email)
    trial_ends_at = None if is_admin else datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS)

    user = User(
        id=uuid.uuid4(),
        email=body.email,
        password_hash=hash_password(body.password),
        is_admin=is_admin,
        trial_ends_at=trial_ends_at,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return _token_response(user)


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    return MeResponse(
        user_id=str(current_user.id),
        email=current_user.email,
        plan=current_user.plan,
        is_admin=current_user.is_admin,
        trial_ends_at=current_user.trial_ends_at,
        default_tone=current_user.default_tone,
        signature=current_user.signature,
        followup_default_days=current_user.followup_default_days,
        openai_api_key_hint=_key_hint(current_user),
    )


@router.patch("/me", response_model=MeResponse)
def update_me(body: UpdateMeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if body.new_password is not None:
        if not body.current_password:
            raise HTTPException(status_code=400, detail="current_password is required to set a new password")
        if not verify_password(body.current_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if len(body.new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
        current_user.password_hash = hash_password(body.new_password)

    if body.default_tone is not None:
        current_user.default_tone = body.default_tone
    if body.signature is not None:
        current_user.signature = body.signature
    if body.followup_default_days is not None:
        current_user.followup_default_days = max(1, min(30, body.followup_default_days))
    if body.openai_api_key is not None:
        if body.openai_api_key == "":
            current_user.openai_api_key = None
        else:
            current_user.openai_api_key = encrypt_field(body.openai_api_key)

    db.commit()
    db.refresh(current_user)
    return MeResponse(
        user_id=str(current_user.id),
        email=current_user.email,
        plan=current_user.plan,
        is_admin=current_user.is_admin,
        trial_ends_at=current_user.trial_ends_at,
        default_tone=current_user.default_tone,
        signature=current_user.signature,
        followup_default_days=current_user.followup_default_days,
        openai_api_key_hint=_key_hint(current_user),
    )


@router.delete("/me", status_code=204)
def delete_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
