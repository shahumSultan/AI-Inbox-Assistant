import uuid
from datetime import datetime

from pydantic import BaseModel


class OAuthConnectionOut(BaseModel):
    id: uuid.UUID
    provider: str
    email_address: str
    last_synced_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConnectUrlResponse(BaseModel):
    url: str


class SyncResult(BaseModel):
    synced: int
    skipped: int
    errors: int
