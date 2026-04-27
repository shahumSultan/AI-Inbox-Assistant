from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    plan: str
    is_admin: bool
    trial_ends_at: Optional[datetime]


class MeResponse(BaseModel):
    user_id: str
    email: str
    plan: str
    is_admin: bool
    trial_ends_at: Optional[datetime]
    default_tone: str
    signature: Optional[str]
    followup_default_days: int
    openai_api_key_hint: Optional[str] = None  # last 4 chars, e.g. "...ab1c"


class UpdateMeRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: Optional[str] = None
    default_tone: Optional[str] = None
    signature: Optional[str] = None
    followup_default_days: Optional[int] = None
    openai_api_key: Optional[str] = None  # empty string = clear, non-empty = encrypt and save
