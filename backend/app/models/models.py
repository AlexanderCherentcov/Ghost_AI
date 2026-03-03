from sqlalchemy import (
    Column, String, Integer, BigInteger, Boolean, Text, DateTime,
    ForeignKey, Numeric, Index, UniqueConstraint, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(64), nullable=True)
    email = Column(String(255), nullable=True, unique=True)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_banned = Column(Boolean, default=False, nullable=False)
    is_shadow_banned = Column(Boolean, default=False, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    locale = Column(String(8), default="ru")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    identities = relationship("AuthIdentity", back_populates="user", cascade="all, delete-orphan")
    wallet = relationship("CreditsWallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user")
    messages = relationship("Message", back_populates="user")
    documents = relationship("Document", back_populates="user")
    sessions = relationship("Session", back_populates="user")


class AuthIdentity(Base):
    __tablename__ = "auth_identities"
    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_auth_provider"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(20), nullable=False)  # telegram | google | yandex
    provider_user_id = Column(String(128), nullable=False)
    provider_data = Column(JSONB, nullable=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="identities")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(32), primary_key=True)  # free, starter, pro, creator, elite
    name = Column(String(64), nullable=False)
    price_rub_month = Column(Integer, nullable=False, default=0)
    credits_monthly = Column(Integer, nullable=False)
    credits_daily_limit = Column(Integer, nullable=True)
    max_file_size_mb = Column(Integer, default=10)
    max_context_msgs = Column(Integer, default=10)
    max_documents = Column(Integer, default=0)
    features = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(String(32), ForeignKey("plans.id"), nullable=False)
    status = Column(String(20), nullable=False, default="active")  # active|cancelled|expired
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    payment_ref = Column(String(128), nullable=True)
    auto_renew = Column(Boolean, default=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")


class CreditsWallet(Base):
    __tablename__ = "credits_wallet"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    balance = Column(BigInteger, nullable=False, default=0)
    bonus_balance = Column(BigInteger, nullable=False, default=0)
    monthly_quota = Column(BigInteger, nullable=False, default=0)
    monthly_quota_used = Column(BigInteger, nullable=False, default=0)
    daily_used = Column(BigInteger, nullable=False, default=0)
    daily_reset_at = Column(DateTime(timezone=True), nullable=True)
    monthly_reset_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="wallet")


class CreditsLedger(Base):
    __tablename__ = "credits_ledger"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(BigInteger, nullable=False)
    balance_after = Column(BigInteger, nullable=False)
    operation = Column(String(32), nullable=False)  # charge|refund|topup|bonus|subscription|admin_grant
    ref_type = Column(String(32), nullable=True)
    ref_id = Column(String(128), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    jti = Column(UUID(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4)
    source = Column(String(20), nullable=False, default="web")  # tg_bot|miniapp|web
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")


class Mode(Base):
    __tablename__ = "modes"

    id = Column(String(64), primary_key=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), nullable=False)
    icon_emoji = Column(String(8), nullable=True)
    system_prompt = Column(Text, nullable=False)
    model_policy = Column(JSONB, nullable=False)
    price_policy = Column(JSONB, nullable=False)
    min_plan = Column(String(32), default="free")
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    messages = relationship("Message", back_populates="mode")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mode_id = Column(String(64), ForeignKey("modes.id"), nullable=False)
    role = Column(String(12), nullable=False)  # user|assistant|system
    content = Column(Text, nullable=False)
    content_type = Column(String(20), default="text")
    metadata_ = Column("metadata", JSONB, default={})
    credits_charged = Column(Integer, default=0)
    source = Column(String(20), default="web")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="messages")
    mode = relationship("Mode", back_populates="messages")


class ProviderRequest(Base):
    __tablename__ = "provider_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    mode_id = Column(String(64), nullable=False)
    source = Column(String(20), nullable=False)
    provider = Column(String(32), nullable=False)
    model = Column(String(64), nullable=False)
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    cost_usd_estimated = Column(Numeric(10, 6), default=0)
    credits_charged = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    status = Column(String(20), nullable=False, default="success")
    error_code = Column(String(32), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_url = Column(Text, nullable=False)
    file_type = Column(String(32), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")  # pending|indexing|ready|error
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doc_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    # embedding stored as JSON array (or use pgvector if available)
    embedding_json = Column(JSONB, nullable=True)
    metadata_ = Column("metadata", JSONB, default={})

    document = relationship("Document", back_populates="chunks")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    provider = Column(String(32), nullable=False)
    external_id = Column(String(255), unique=True, nullable=False)
    amount_rub = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    purpose = Column(String(32), nullable=False)  # subscription|credits_topup
    payload = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class Ban(Base):
    __tablename__ = "bans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ban_type = Column(String(20), nullable=False)  # hard|shadow
    reason = Column(Text, nullable=True)
    banned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
