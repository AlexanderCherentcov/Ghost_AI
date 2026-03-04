from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, users, chat, image, docs, voice, admin, plans

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Ghost AI API starting up...")
    yield
    logger.info("Ghost AI API shutting down...")


app = FastAPI(
    title="Ghost AI API",
    description="AI Aggregator - 90 modes, Telegram Bot + Mini App + Web",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/user", tags=["user"])
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(image.router, prefix="/api/image", tags=["image"])
app.include_router(docs.router, prefix="/api/docs", tags=["docs"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Ghost AI API"}
