from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Plan
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("")
async def list_plans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Plan).where(Plan.is_active == True).order_by(Plan.sort_order)
    )
    plans = result.scalars().all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "price_rub_month": p.price_rub_month,
            "credits_monthly": p.credits_monthly,
            "credits_daily_limit": p.credits_daily_limit,
            "max_file_size_mb": p.max_file_size_mb,
            "max_context_msgs": p.max_context_msgs,
            "max_documents": p.max_documents,
            "features": p.features,
        }
        for p in plans
    ]


@router.post("/subscribe")
async def subscribe(
    plan_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan = await db.get(Plan, plan_id)
    if not plan or not plan.is_active:
        raise HTTPException(404, "Plan not found")

    if plan.price_rub_month == 0:
        raise HTTPException(400, "Cannot subscribe to free plan")

    # Create payment (stub - integrate with real payment provider)
    import uuid
    payment_id = str(uuid.uuid4())

    from app.models.models import Payment
    from datetime import datetime, timezone
    payment = Payment(
        user_id=user.id,
        provider="yookassa",
        external_id=payment_id,
        amount_rub=plan.price_rub_month,
        status="pending",
        purpose="subscription",
        payload={"plan_id": plan_id},
    )
    db.add(payment)
    await db.commit()

    # In production: call YooKassa API to get payment_url
    payment_url = f"https://ghostai.ru/payment/mock?id={payment_id}&plan={plan_id}"

    return {
        "payment_id": payment_id,
        "payment_url": payment_url,
        "amount": plan.price_rub_month,
        "plan": plan.name,
    }
