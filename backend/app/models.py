from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Date,
    DateTime, ForeignKey, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .database import Base


class User(Base):
    __tablename__ = "users"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email            = Column(String, unique=True, nullable=False, index=True)
    password_hash    = Column(String, nullable=False)
    plan             = Column(String, nullable=False, default="free")   # free|pro|team
    default_tone     = Column(String, nullable=False, default="professional")
    signature        = Column(Text, nullable=True)
    followup_default_days = Column(Integer, nullable=False, default=3)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    threads = relationship("ConversationThread", back_populates="user", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="user", cascade="all, delete-orphan")
    replies = relationship("GeneratedReply", back_populates="user", cascade="all, delete-orphan")


class ConversationThread(Base):
    __tablename__ = "conversation_threads"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title            = Column(String, nullable=False)
    source           = Column(String, nullable=False, default="paste")  # paste|upload|forwarded
    raw_text         = Column(Text, nullable=False)
    summary          = Column(Text, nullable=True)
    primary_intent   = Column(String, nullable=True)
    priority_score   = Column(Integer, nullable=True)                   # 1-5
    status           = Column(String, nullable=False, default="active") # active|waiting|closed|archived
    confidence_score = Column(Numeric(4, 3), nullable=True)             # 0-1
    last_message_at  = Column(DateTime(timezone=True), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user     = relationship("User", back_populates="threads")
    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan")
    actions  = relationship("Action", back_populates="thread", cascade="all, delete-orphan")
    replies  = relationship("GeneratedReply", back_populates="thread", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id         = Column(UUID(as_uuid=True), ForeignKey("conversation_threads.id", ondelete="CASCADE"), nullable=False)
    sender_name       = Column(String, nullable=True)
    sender_email      = Column(String, nullable=True)
    message_body      = Column(Text, nullable=False)
    message_timestamp = Column(DateTime(timezone=True), nullable=True)
    sequence_index    = Column(Integer, nullable=False)

    thread = relationship("ConversationThread", back_populates="messages")


class Action(Base):
    __tablename__ = "actions"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id           = Column(UUID(as_uuid=True), ForeignKey("conversation_threads.id", ondelete="CASCADE"), nullable=False)
    user_id             = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type                = Column(String, nullable=False)  # reply|follow_up|schedule|task|ignore
    title               = Column(String, nullable=False)
    suggested_next_step = Column(Text, nullable=False)
    suggested_text      = Column(Text, nullable=True)
    priority            = Column(Integer, nullable=False, default=3)  # 1-5
    due_date            = Column(Date, nullable=True)
    status              = Column(String, nullable=False, default="open")  # open|done|dismissed
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    thread = relationship("ConversationThread", back_populates="actions")
    user   = relationship("User", back_populates="actions")


class GeneratedReply(Base):
    __tablename__ = "generated_replies"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id  = Column(UUID(as_uuid=True), ForeignKey("conversation_threads.id", ondelete="CASCADE"), nullable=False)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal       = Column(String, nullable=False)
    tone       = Column(String, nullable=False)
    reply_text = Column(Text, nullable=False)
    version    = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    thread = relationship("ConversationThread", back_populates="replies")
    user   = relationship("User", back_populates="replies")
