import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)


async def generate_image(ctx, task_id: str, user_id: str, prompt: str,
                         negative_prompt: str = None, width: int = 512,
                         height: int = 512, steps: int = 20, credit_cost: int = 6):
    """Arq worker: generate image"""
    from app.core.redis import get_redis
    from app.core.database import AsyncSessionLocal
    from app.services.credits import check_and_deduct

    redis = await get_redis()

    # Update status
    await redis.setex(f"task:status:{task_id}", 3600, json.dumps({"status": "processing"}))

    try:
        from app.services.providers.image import get_image_provider
        provider = get_image_provider()

        result = await provider.generate(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            steps=steps,
        )

        # Deduct credits
        async with AsyncSessionLocal() as db:
            await check_and_deduct(db, user_id, credit_cost, "charge", description=f"Image: {prompt[:50]}")

        await redis.setex(
            f"task:status:{task_id}", 3600,
            json.dumps({"status": "done", "image_url": result.image_url, "credits_used": credit_cost})
        )
        logger.info(f"Image task {task_id} completed")

    except Exception as e:
        logger.error(f"Image task {task_id} failed: {e}")
        await redis.setex(
            f"task:status:{task_id}", 3600,
            json.dumps({"status": "error", "error": str(e)})
        )
        raise


async def synthesize_tts(ctx, task_id: str, user_id: str, text: str,
                          voice_id: str = None, credit_cost: int = 3):
    """Arq worker: TTS synthesis"""
    from app.core.redis import get_redis
    from app.core.database import AsyncSessionLocal
    from app.services.credits import check_and_deduct

    redis = await get_redis()
    await redis.setex(f"task:status:{task_id}", 3600, json.dumps({"status": "processing"}))

    try:
        from app.services.providers.stt_tts import get_tts_provider
        provider = get_tts_provider()
        result = await provider.synthesize(text, voice_id=voice_id)

        async with AsyncSessionLocal() as db:
            await check_and_deduct(db, user_id, credit_cost, "charge", description="TTS synthesis")

        await redis.setex(
            f"task:status:{task_id}", 3600,
            json.dumps({"status": "done", "audio_url": result.audio_url, "credits_used": credit_cost})
        )

    except Exception as e:
        logger.error(f"TTS task {task_id} failed: {e}")
        await redis.setex(
            f"task:status:{task_id}", 3600,
            json.dumps({"status": "error", "error": str(e)})
        )
        raise


async def index_document(ctx, doc_id: str, filepath: str, file_type: str):
    """Arq worker: index document for RAG"""
    from app.core.database import AsyncSessionLocal
    from app.models.models import Document, DocumentChunk
    import uuid

    async with AsyncSessionLocal() as db:
        doc = await db.get(Document, uuid.UUID(doc_id))
        if not doc:
            return

        doc.status = "indexing"
        await db.commit()

        try:
            # Extract text
            text = ""
            if file_type == "txt" or file_type == "md":
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
            elif file_type == "pdf":
                try:
                    import fitz  # PyMuPDF
                    pdf = fitz.open(filepath)
                    for page in pdf:
                        text += page.get_text()
                except Exception:
                    with open(filepath, "rb") as f:
                        text = f.read().decode("utf-8", errors="ignore")
            else:
                text = f"[{file_type.upper()} document - text extraction not available]"

            # Chunk text (500 tokens ~= 2000 chars)
            chunk_size = 2000
            overlap = 200
            chunks = []
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunk = text[start:end]
                if chunk.strip():
                    chunks.append(chunk)
                start = end - overlap

            # Save chunks (without embeddings for now)
            for i, chunk_text in enumerate(chunks):
                chunk = DocumentChunk(
                    doc_id=doc.id,
                    chunk_index=i,
                    content=chunk_text,
                )
                db.add(chunk)

            doc.status = "ready"
            doc.chunk_count = len(chunks)
            await db.commit()

            logger.info(f"Document {doc_id} indexed: {len(chunks)} chunks")

        except Exception as e:
            logger.error(f"Document indexing failed {doc_id}: {e}")
            doc.status = "error"
            await db.commit()
            raise


async def cleanup_expired_sessions(ctx):
    """Cron: cleanup expired sessions"""
    from app.core.database import AsyncSessionLocal
    from app.models.models import Session
    from sqlalchemy import delete

    async with AsyncSessionLocal() as db:
        await db.execute(
            delete(Session).where(Session.expires_at < datetime.now(timezone.utc))
        )
        await db.commit()
    logger.info("Cleaned up expired sessions")


async def reset_daily_credits(ctx):
    """Cron: reset daily credit counters"""
    from app.core.database import AsyncSessionLocal
    from app.models.models import CreditsWallet
    from sqlalchemy import update

    async with AsyncSessionLocal() as db:
        await db.execute(
            update(CreditsWallet)
            .where(CreditsWallet.daily_reset_at < datetime.now(timezone.utc).date())
            .values(daily_used=0, daily_reset_at=datetime.now(timezone.utc))
        )
        await db.commit()
    logger.info("Reset daily credits")


async def renew_subscriptions(ctx):
    """Cron: process subscription renewals"""
    from app.core.database import AsyncSessionLocal
    from app.models.models import Subscription, CreditsWallet, Plan
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Subscription).where(
                Subscription.status == "active",
                Subscription.expires_at < datetime.now(timezone.utc) + timedelta(days=1),
                Subscription.auto_renew == True,
            )
        )
        subs = result.scalars().all()

        for sub in subs:
            # In production: call payment provider to charge
            # For now: just expire
            sub.status = "expired"
            await db.commit()

    logger.info(f"Processed {len(subs)} subscription renewals")


class WorkerSettings:
    from arq.connections import RedisSettings
    from app.core.config import settings as app_settings
    import re

    redis_url = app_settings.REDIS_URL
    m = re.match(r"redis://:(.+)@(.+):(\d+)", redis_url)
    if m:
        redis_settings = RedisSettings(host=m.group(2), port=int(m.group(3)), password=m.group(1))
    else:
        redis_settings = RedisSettings()

    functions = [generate_image, synthesize_tts, index_document]
    cron_jobs = []  # Add cron jobs here
    max_jobs = 10
    job_timeout = 300
    queue_name = "ghost_ai_queue"
    health_check_interval = 30
