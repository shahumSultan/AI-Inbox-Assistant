from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text
import os

from app.database import Base, engine
from app.routers import health
from app.routers.auth import router as auth_router
from app.routers.threads import router as threads_router
from app.routers.actions import router as actions_router
from app.routers.replies import router as replies_router
from app.routers.dashboard import router as dashboard_router
from app.routers.oauth import router as oauth_router

load_dotenv()


def _run_migrations():
    """Idempotent column additions for schema changes without Alembic."""
    with engine.connect() as conn:
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ"
        ))
        # Back-fill trial for existing users who have no trial_ends_at
        conn.execute(text(
            "UPDATE users SET trial_ends_at = created_at + INTERVAL '14 days' "
            "WHERE trial_ends_at IS NULL AND is_admin = FALSE"
        ))
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS openai_api_key TEXT"
        ))
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS groq_api_key TEXT"
        ))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS oauth_connections (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                provider VARCHAR NOT NULL,
                email_address VARCHAR NOT NULL,
                access_token TEXT NOT NULL,
                refresh_token TEXT NOT NULL,
                token_expiry TIMESTAMPTZ,
                last_synced_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        conn.execute(text(
            "ALTER TABLE conversation_threads ADD COLUMN IF NOT EXISTS external_id VARCHAR"
        ))
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    yield


app = FastAPI(title="AI Inbox Assistant API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth_router)
app.include_router(threads_router)
app.include_router(actions_router)
app.include_router(replies_router)
app.include_router(dashboard_router)
app.include_router(oauth_router)


@app.get("/")
def root():
    return {"message": "AI Inbox Assistant API"}
