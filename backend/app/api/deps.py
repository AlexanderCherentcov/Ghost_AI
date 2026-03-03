from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User
from app.core.redis import get_redis
import uuid

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(401, "Authorization header required")

    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    jti = payload.get("jti")

    if not user_id or not jti:
        raise HTTPException(401, "Invalid token")

    # Check blacklist
    redis = await get_redis()
    if await redis.get(f"blacklist:jti:{jti}"):
        raise HTTPException(401, "Token revoked")

    user = await db.get(User, uuid.UUID(user_id))
    if not user or not user.is_active or user.is_banned:
        raise HTTPException(401, "User not found or banned")

    return user


async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "Admin access required")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
