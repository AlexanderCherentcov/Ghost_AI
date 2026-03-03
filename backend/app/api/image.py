from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import json

from app.core.database import get_db
from app.models.models import User, Mode
from app.api.deps import get_current_user
from app.schemas.schemas import ImageGenerateRequest
from app.services.auth import get_active_subscription
from app.services.credits import get_or_create_wallet, IMAGE_CREDITS
from app.services.rate_limit import rate_limit_middleware
from app.core.redis import get_redis

router = APIRouter()

PLAN_IMAGE_ACCESS = ["pro", "creator", "elite"]
PLAN_ORDER = ["free", "starter", "pro", "creator", "elite"]


@router.post("/generate")
async def generate_image(
    data: ImageGenerateRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await rate_limit_middleware(request, str(user.id))

    plan_id = await get_active_subscription(db, str(user.id))
    if PLAN_ORDER.index(plan_id) < PLAN_ORDER.index("pro"):
        raise HTTPException(403, detail={"error": "plan_upgrade_required", "min_plan": "pro"})

    # Determine credit cost
    w = data.width or 512
    h = data.height or 512
    if w >= 1024 or h >= 1024:
        credit_cost = IMAGE_CREDITS["sd_1024"]
    else:
        credit_cost = IMAGE_CREDITS["sd_512"]

    wallet = await get_or_create_wallet(db, str(user.id))
    if wallet.balance + wallet.bonus_balance < credit_cost:
        raise HTTPException(402, detail={"error": "insufficient_credits", "required": credit_cost})

    task_id = str(uuid.uuid4())

    # Queue the task
    try:
        from arq import create_pool
        from arq.connections import RedisSettings
        from app.core.config import settings
        import re
        m = re.match(r"redis://:(.+)@(.+):(\d+)", settings.REDIS_URL)
        if m:
            arq_pool = await create_pool(RedisSettings(host=m.group(2), port=int(m.group(3)), password=m.group(1)))
        else:
            arq_pool = await create_pool(RedisSettings())

        await arq_pool.enqueue_job(
            "generate_image",
            task_id=task_id,
            user_id=str(user.id),
            prompt=data.prompt,
            negative_prompt=data.negative_prompt,
            width=data.width,
            height=data.height,
            steps=data.steps,
            credit_cost=credit_cost,
        )
        await arq_pool.aclose()
    except Exception as e:
        # Store task in Redis directly if Arq unavailable
        redis = await get_redis()
        await redis.setex(
            f"task:{task_id}",
            3600,
            json.dumps({
                "status": "queued",
                "user_id": str(user.id),
                "prompt": data.prompt,
                "credit_cost": credit_cost,
            })
        )

    # Set initial task status
    redis = await get_redis()
    await redis.setex(
        f"task:status:{task_id}",
        3600,
        json.dumps({"status": "queued", "credits_reserved": credit_cost}),
    )

    return {
        "task_id": task_id,
        "status": "queued",
        "estimated_seconds": 30,
        "credits_reserved": credit_cost,
    }


@router.get("/status/{task_id}")
async def image_status(
    task_id: str,
    user: User = Depends(get_current_user),
):
    redis = await get_redis()
    data = await redis.get(f"task:status:{task_id}")
    if not data:
        raise HTTPException(404, "Task not found")

    task_data = json.loads(data)
    return task_data
