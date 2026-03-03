import time
import uuid
from fastapi import Request, HTTPException
from app.core.redis import get_redis


async def check_rate_limit(
    identifier: str,
    window_seconds: int = 60,
    max_requests: int = 30,
    prefix: str = "rl",
):
    redis = await get_redis()
    key = f"{prefix}:{identifier}"
    now = time.time()

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, now - window_seconds)
    pipe.zadd(key, {str(uuid.uuid4()): now})
    pipe.zcard(key)
    pipe.expire(key, window_seconds)
    results = await pipe.execute()

    count = results[2]
    if count > max_requests:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please slow down.",
            headers={"Retry-After": str(window_seconds)},
        )

    return count


async def rate_limit_middleware(request: Request, user_id: str = None):
    """Apply rate limiting per user and per IP"""
    ip = request.client.host if request.client else "unknown"

    # IP-based rate limit (for unauthenticated)
    await check_rate_limit(f"ip:{ip}", window_seconds=60, max_requests=60, prefix="rl")

    # User-based rate limit
    if user_id:
        await check_rate_limit(f"user:{user_id}", window_seconds=60, max_requests=30, prefix="rl")
