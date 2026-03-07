from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime
import uuid


# --- Auth ---
class TelegramMiniAppAuth(BaseModel):
    init_data: str


class TelegramWebAuth(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str


class TelegramBotAuth(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None


class TelegramLoginConfirm(BaseModel):
    token: str
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    admin_secret: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# --- User ---
class UserResponse(BaseModel):
    id: str
    username: Optional[str]
    email: Optional[str]
    avatar_url: Optional[str]
    plan_id: str = "free"
    created_at: datetime

    class Config:
        from_attributes = True


class BalanceResponse(BaseModel):
    balance: int
    bonus_balance: int
    monthly_quota: int
    monthly_quota_used: int
    daily_used: int
    daily_limit: Optional[int]
    plan_id: str


# --- Plans ---
class PlanResponse(BaseModel):
    id: str
    name: str
    price_rub_month: int
    credits_monthly: int
    credits_daily_limit: Optional[int]
    features: Dict[str, Any]
    is_active: bool

    class Config:
        from_attributes = True


class SubscribeRequest(BaseModel):
    plan_id: str


class SubscribeResponse(BaseModel):
    payment_url: str
    payment_id: str


# --- Chat ---
class ChatSendRequest(BaseModel):
    mode_id: str
    content: str
    files: Optional[List[str]] = None
    request_id: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    content_type: str
    credits_charged: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    has_more: bool


# --- Image ---
class ImageGenerateRequest(BaseModel):
    mode_id: str
    prompt: str
    negative_prompt: Optional[str] = None
    width: Optional[int] = 512
    height: Optional[int] = 512
    steps: Optional[int] = 20


class TaskResponse(BaseModel):
    task_id: str
    status: str
    estimated_seconds: Optional[int] = None
    credits_reserved: Optional[int] = None


class ImageStatusResponse(BaseModel):
    task_id: str
    status: str  # queued|processing|done|error
    image_url: Optional[str] = None
    credits_used: Optional[int] = None
    error: Optional[str] = None


# --- Docs ---
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    status: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class DocQueryRequest(BaseModel):
    doc_id: str
    question: str
    mode_id: Optional[str] = "doc_qa"


# --- Voice ---
class STTResponse(BaseModel):
    transcript: str
    duration_sec: float
    credits_used: int


class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None


class TTSResponse(BaseModel):
    audio_url: Optional[str] = None
    task_id: Optional[str] = None
    status: str
    credits_used: Optional[int] = None


# --- Modes ---
class ModeResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: str
    icon_emoji: Optional[str]
    min_plan: str
    is_active: bool
    sort_order: int

    class Config:
        from_attributes = True


# --- Admin ---
class AdminGrantCreditsRequest(BaseModel):
    credits: int
    reason: str


class AdminBanRequest(BaseModel):
    ban_type: str  # hard|shadow
    reason: str
    expires_at: Optional[datetime] = None


class AdminUserResponse(BaseModel):
    id: str
    username: Optional[str]
    email: Optional[str]
    is_banned: bool
    is_shadow_banned: bool
    is_admin: bool
    plan_id: str
    balance: int
    created_at: datetime
