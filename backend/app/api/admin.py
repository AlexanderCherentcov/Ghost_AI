from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.models import User, CreditsWallet, ProviderRequest, Ban, Subscription, Mode
from app.api.deps import get_admin_user
from app.schemas.schemas import AdminGrantCreditsRequest, AdminBanRequest
from app.services.credits import add_credits

router = APIRouter()


@router.get("/users")
async def list_users(
    search: str = None,
    page: int = 1,
    limit: int = 20,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    query = select(User).order_by(desc(User.created_at))

    if search:
        from sqlalchemy import or_
        query = query.where(
            or_(
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar()

    result = await db.execute(query.offset(offset).limit(limit))
    users = result.scalars().all()

    from app.services.auth import get_active_subscription

    out = []
    for u in users:
        wallet = await db.get(CreditsWallet, u.id)
        plan_id = await get_active_subscription(db, str(u.id))
        out.append({
            "id": str(u.id),
            "username": u.username,
            "email": u.email,
            "is_banned": u.is_banned,
            "is_shadow_banned": u.is_shadow_banned,
            "is_admin": u.is_admin,
            "plan_id": plan_id,
            "balance": (wallet.balance + wallet.bonus_balance) if wallet else 0,
            "created_at": u.created_at,
        })

    return {"users": out, "total": total, "page": page}


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(404, "User not found")

    wallet = await db.get(CreditsWallet, user.id)
    from app.services.auth import get_active_subscription
    plan_id = await get_active_subscription(db, str(user.id))

    # Last 10 requests
    requests_result = await db.execute(
        select(ProviderRequest)
        .where(ProviderRequest.user_id == user.id)
        .order_by(desc(ProviderRequest.created_at))
        .limit(10)
    )
    requests = requests_result.scalars().all()

    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "is_banned": user.is_banned,
        "is_shadow_banned": user.is_shadow_banned,
        "is_admin": user.is_admin,
        "plan_id": plan_id,
        "balance": (wallet.balance + wallet.bonus_balance) if wallet else 0,
        "created_at": user.created_at,
        "recent_requests": [
            {
                "id": str(r.id),
                "mode_id": r.mode_id,
                "provider": r.provider,
                "model": r.model,
                "credits_charged": r.credits_charged,
                "status": r.status,
                "created_at": r.created_at,
            }
            for r in requests
        ],
    }


@router.post("/users/{user_id}/grant")
async def grant_credits(
    user_id: str,
    data: AdminGrantCreditsRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(404, "User not found")

    new_balance = await add_credits(
        db=db,
        user_id=user_id,
        amount=data.credits,
        operation="admin_grant",
        description=f"Admin grant by {admin.username}: {data.reason}",
    )

    return {"message": f"Granted {data.credits} credits", "new_balance": new_balance}


@router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    data: AdminBanRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(404, "User not found")

    if data.ban_type == "hard":
        user.is_banned = True
    elif data.ban_type == "shadow":
        user.is_shadow_banned = True

    ban = Ban(
        user_id=user.id,
        ban_type=data.ban_type,
        reason=data.reason,
        banned_by=admin.id,
        expires_at=data.expires_at,
    )
    db.add(ban)
    await db.commit()

    return {"message": f"User {data.ban_type}-banned", "user_id": user_id}


@router.post("/users/{user_id}/unban")
async def unban_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(404, "User not found")

    user.is_banned = False
    user.is_shadow_banned = False
    await db.commit()

    return {"message": "User unbanned"}


@router.get("/stats")
async def get_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()
    total_requests = (await db.execute(select(func.count()).select_from(ProviderRequest))).scalar()
    total_credits_charged = (await db.execute(select(func.sum(ProviderRequest.credits_charged)))).scalar() or 0

    # Top modes
    from sqlalchemy import text
    top_modes_result = await db.execute(
        select(ProviderRequest.mode_id, func.count().label("count"))
        .group_by(ProviderRequest.mode_id)
        .order_by(desc("count"))
        .limit(10)
    )
    top_modes = [{"mode_id": r.mode_id, "count": r.count} for r in top_modes_result]

    return {
        "total_users": total_users,
        "total_requests": total_requests,
        "total_credits_charged": total_credits_charged,
        "top_modes": top_modes,
    }


@router.get("/logs")
async def get_logs(
    user_id: str = None,
    provider: str = None,
    status: str = None,
    page: int = 1,
    limit: int = 50,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    query = select(ProviderRequest).order_by(desc(ProviderRequest.created_at))

    import uuid
    if user_id:
        query = query.where(ProviderRequest.user_id == uuid.UUID(user_id))
    if provider:
        query = query.where(ProviderRequest.provider == provider)
    if status:
        query = query.where(ProviderRequest.status == status)

    result = await db.execute(query.offset(offset).limit(limit))
    logs = result.scalars().all()

    return {
        "logs": [
            {
                "id": str(r.id),
                "user_id": str(r.user_id),
                "mode_id": r.mode_id,
                "provider": r.provider,
                "model": r.model,
                "tokens_in": r.tokens_in,
                "tokens_out": r.tokens_out,
                "credits_charged": r.credits_charged,
                "latency_ms": r.latency_ms,
                "status": r.status,
                "created_at": r.created_at,
            }
            for r in logs
        ]
    }


@router.patch("/modes/{mode_id}")
async def update_mode(
    mode_id: str,
    is_active: bool = None,
    min_plan: str = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    mode = await db.get(Mode, mode_id)
    if not mode:
        raise HTTPException(404, "Mode not found")

    if is_active is not None:
        mode.is_active = is_active
    if min_plan is not None:
        mode.min_plan = min_plan

    await db.commit()
    return {"message": "Mode updated", "mode_id": mode_id}
