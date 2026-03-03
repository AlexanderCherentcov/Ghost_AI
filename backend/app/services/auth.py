from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
import uuid
import json

from app.models.models import User, AuthIdentity, CreditsWallet, Session, Subscription, Plan
from app.core.config import settings
from app.core.security import create_access_token


async def get_active_subscription(db: AsyncSession, user_id: str) -> str:
    """Get current plan_id for user"""
    result = await db.execute(
        select(Subscription)
        .where(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.expires_at > datetime.now(timezone.utc),
        )
        .order_by(Subscription.expires_at.desc())
    )
    sub = result.scalar_one_or_none()
    return sub.plan_id if sub else "free"


async def upsert_user_by_identity(
    db: AsyncSession,
    provider: str,
    provider_user_id: str,
    provider_data: dict,
    email: str = None,
) -> tuple[User, str]:
    """Find or create user, return (user, access_token)"""

    # 1. Search by provider identity
    result = await db.execute(
        select(AuthIdentity).where(
            AuthIdentity.provider == provider,
            AuthIdentity.provider_user_id == str(provider_user_id),
        )
    )
    identity = result.scalar_one_or_none()

    if identity:
        user = await db.get(User, identity.user_id)
        # Update provider data
        identity.provider_data = provider_data
        await db.commit()
    else:
        # 2. Try to merge by email
        user = None
        if email:
            result = await db.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()

        if not user:
            # 3. Create new user
            user = User(
                username=provider_data.get("name") or provider_data.get("username"),
                email=email,
                avatar_url=provider_data.get("avatar_url"),
            )
            db.add(user)
            await db.flush()

            # Free credits wallet
            wallet = CreditsWallet(
                user_id=user.id,
                balance=settings.FREE_CREDITS,
                monthly_quota=0,
                daily_reset_at=datetime.now(timezone.utc),
                monthly_reset_at=datetime.now(timezone.utc),
            )
            db.add(wallet)

        # Add identity
        identity = AuthIdentity(
            user_id=user.id,
            provider=provider,
            provider_user_id=str(provider_user_id),
            provider_data=provider_data,
        )
        db.add(identity)
        await db.commit()
        await db.refresh(user)

    if user.is_banned:
        from fastapi import HTTPException
        raise HTTPException(403, "Account banned")

    # Create session + JWT
    jti = uuid.uuid4()
    session = Session(
        user_id=user.id,
        jti=jti,
        source=provider,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRE_DAYS),
    )
    db.add(session)
    await db.commit()

    token = create_access_token(str(user.id), str(jti))
    return user, token


async def get_current_user(token: str, db: AsyncSession) -> User:
    from app.core.security import decode_access_token
    from fastapi import HTTPException
    from app.core.redis import get_redis

    payload = decode_access_token(token)
    user_id = payload.get("sub")
    jti = payload.get("jti")

    if not user_id or not jti:
        raise HTTPException(401, "Invalid token payload")

    # Check blacklist
    redis = await get_redis()
    if await redis.get(f"blacklist:jti:{jti}"):
        raise HTTPException(401, "Token revoked")

    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(401, "User not found")

    return user
