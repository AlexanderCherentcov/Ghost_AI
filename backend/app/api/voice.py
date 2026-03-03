from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import math

from app.core.database import get_db
from app.models.models import User
from app.api.deps import get_current_user
from app.schemas.schemas import TTSRequest
from app.services.auth import get_active_subscription
from app.services.credits import get_or_create_wallet, check_and_deduct, STT_CREDITS_PER_MINUTE, TTS_CREDITS_PER_1K_CHARS
from app.services.rate_limit import rate_limit_middleware

router = APIRouter()

PLAN_ORDER = ["free", "starter", "pro", "creator", "elite"]


@router.post("/stt")
async def speech_to_text(
    request: Request,
    audio: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await rate_limit_middleware(request, str(user.id))

    plan_id = await get_active_subscription(db, str(user.id))
    if PLAN_ORDER.index(plan_id) < PLAN_ORDER.index("starter"):
        raise HTTPException(403, detail={"error": "plan_upgrade_required", "min_plan": "starter"})

    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(400, "Audio file too large (max 25MB)")

    # Estimate duration and credits
    duration_sec = len(audio_bytes) / 16000
    credit_cost = max(1, math.ceil(duration_sec / 60) * STT_CREDITS_PER_MINUTE)

    wallet = await get_or_create_wallet(db, str(user.id))
    if wallet.balance + wallet.bonus_balance < credit_cost:
        raise HTTPException(402, detail={"error": "insufficient_credits", "required": credit_cost})

    from app.services.providers.stt_tts import get_stt_provider
    provider = get_stt_provider()

    try:
        result = await provider.transcribe(audio_bytes, filename=audio.filename or "audio.ogg")
    except Exception as e:
        raise HTTPException(500, f"STT error: {str(e)}")

    await check_and_deduct(db, str(user.id), credit_cost, "charge", description="STT transcription")

    return {
        "transcript": result.transcript,
        "duration_sec": result.duration_sec,
        "credits_used": credit_cost,
    }


@router.post("/tts")
async def text_to_speech(
    data: TTSRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await rate_limit_middleware(request, str(user.id))

    plan_id = await get_active_subscription(db, str(user.id))
    if PLAN_ORDER.index(plan_id) < PLAN_ORDER.index("pro"):
        raise HTTPException(403, detail={"error": "plan_upgrade_required", "min_plan": "pro"})

    if len(data.text) > 5000:
        raise HTTPException(400, "Text too long (max 5000 chars)")

    credit_cost = max(1, math.ceil(len(data.text) / 1000) * TTS_CREDITS_PER_1K_CHARS)

    wallet = await get_or_create_wallet(db, str(user.id))
    if wallet.balance + wallet.bonus_balance < credit_cost:
        raise HTTPException(402, detail={"error": "insufficient_credits", "required": credit_cost})

    # Short texts: synchronous
    if len(data.text) <= 500:
        from app.services.providers.stt_tts import get_tts_provider
        provider = get_tts_provider()

        try:
            result = await provider.synthesize(data.text, voice_id=data.voice_id)
        except Exception as e:
            raise HTTPException(500, f"TTS error: {str(e)}")

        await check_and_deduct(db, str(user.id), credit_cost, "charge", description="TTS synthesis")

        return {
            "audio_url": result.audio_url,
            "status": "done",
            "credits_used": credit_cost,
        }

    # Long texts: async via worker
    task_id = str(uuid.uuid4())
    from app.core.redis import get_redis
    import json
    redis = await get_redis()
    await redis.setex(
        f"task:status:{task_id}",
        3600,
        json.dumps({"status": "queued", "credits_reserved": credit_cost}),
    )

    return {
        "task_id": task_id,
        "status": "queued",
        "credits_used": None,
    }


@router.get("/tts/status/{task_id}")
async def tts_status(task_id: str, user: User = Depends(get_current_user)):
    from app.core.redis import get_redis
    import json
    redis = await get_redis()
    data = await redis.get(f"task:status:{task_id}")
    if not data:
        raise HTTPException(404, "Task not found")
    return json.loads(data)
