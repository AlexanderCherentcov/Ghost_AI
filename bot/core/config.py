from pydantic_settings import BaseSettings


class BotConfig(BaseSettings):
    BOT_TOKEN: str = "your_bot_token"
    API_BASE_URL: str = "http://localhost:8000"
    REDIS_URL: str = "redis://localhost:6379"
    MINIAPP_URL: str = "https://ghostai.ru/app"
    ADMIN_SECRET_KEY: str = "admin-secret-key"

    class Config:
        env_file = ".env"
