from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Ghost AI"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production-min-64-chars-random-string"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ghost:ghostpass@postgres:5432/ghost_ai"

    # Redis
    REDIS_URL: str = "redis://:redispass@redis:6379"

    # JWT
    JWT_SECRET: str = "change-me-jwt-secret-min-64-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 30

    # Telegram
    BOT_TOKEN: str = "your_bot_token_here"
    BOT_WEBHOOK_SECRET: str = "webhook_secret"
    MINIAPP_URL: str = "https://ghostai.ru/app"

    # OAuth - Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "https://ghostai.ru/api/auth/google/callback"

    # OAuth - Yandex
    YANDEX_CLIENT_ID: str = ""
    YANDEX_CLIENT_SECRET: str = ""
    YANDEX_REDIRECT_URI: str = "https://ghostai.ru/api/auth/yandex/callback"

    # Providers - LLM
    LLM_PREMIUM_API_KEY: str = ""
    LLM_PREMIUM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_PREMIUM_MODEL: str = "gpt-4o"

    LLM_ECONOMY_API_KEY: str = ""
    LLM_ECONOMY_BASE_URL: str = "https://api.together.xyz/v1"
    LLM_ECONOMY_MODEL: str = "meta-llama/Llama-3.1-70B-Instruct"

    # Providers - Image
    IMAGE_API_KEY: str = ""
    IMAGE_API_URL: str = "https://api.stability.ai"

    # Providers - STT/TTS
    WHISPER_API_KEY: str = ""
    TTS_API_KEY: str = ""
    TTS_VOICE_ID: str = "alloy"

    # Storage (S3/MinIO)
    S3_ENDPOINT: str = "http://minio:9000"
    S3_BUCKET: str = "ghost-ai"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"

    # Payment
    PAYMENT_PROVIDER: str = "yookassa"
    YOOKASSA_SHOP_ID: str = ""
    YOOKASSA_SECRET_KEY: str = ""
    PAYMENT_RETURN_URL: str = "https://ghostai.ru/payment/success"

    # Admin
    ADMIN_SECRET_KEY: str = "admin-secret-key"

    # CORS — comma-separated string OR JSON array (stored as str to avoid pydantic-settings v2 pre-parsing)
    CORS_ORIGINS: str = "https://ghostai.ru,http://localhost:3000,http://localhost:5173"

    # Free credits for new users
    FREE_CREDITS: int = 15

    def get_cors_origins(self) -> List[str]:
        v = self.CORS_ORIGINS.strip()
        if v.startswith("["):
            return json.loads(v)
        return [o.strip() for o in v.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
