from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import User, CreditsWallet, CreditsLedger
from app.api.deps import get_current_user
from app.services.auth import get_active_subscription

router = APIRouter()


@router.get("/me")
async def get_me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan_id = await get_active_subscription(db, str(user.id))
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "plan_id": plan_id,
        "created_at": user.created_at,
        "is_admin": user.is_admin,
    }


@router.get("/balance")
async def get_balance(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.credits import get_or_create_wallet
    wallet = await get_or_create_wallet(db, str(user.id))
    plan_id = await get_active_subscription(db, str(user.id))

    from app.models.models import Plan
    plan = await db.get(Plan, plan_id)
    daily_limit = plan.credits_daily_limit if plan else None

    return {
        "balance": wallet.balance,
        "bonus_balance": wallet.bonus_balance,
        "total": wallet.balance + wallet.bonus_balance,
        "monthly_quota": wallet.monthly_quota,
        "monthly_quota_used": wallet.monthly_quota_used,
        "daily_used": wallet.daily_used,
        "daily_limit": daily_limit,
        "plan_id": plan_id,
    }


@router.get("/usage")
async def get_usage(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = 1,
    limit: int = 20,
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(CreditsLedger)
        .where(
            CreditsLedger.user_id == user.id,
            CreditsLedger.amount < 0,
        )
        .order_by(CreditsLedger.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    ledger = result.scalars().all()

    return {
        "items": [
            {
                "id": str(e.id),
                "amount": e.amount,
                "operation": e.operation,
                "description": e.description,
                "created_at": e.created_at,
            }
            for e in ledger
        ],
        "page": page,
        "limit": limit,
    }
