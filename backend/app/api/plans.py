import uuid
import asyncio
import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Plan, Payment, Subscription, CreditsWallet, CreditsLedger, User
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


# ─── List plans ────────────────────────────────────────────────────────────────

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


# ─── Subscribe (create YooKassa payment) ───────────────────────────────────────

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

    if not settings.YOOKASSA_SHOP_ID or not settings.YOOKASSA_SECRET_KEY:
        raise HTTPException(503, "Платёжный провайдер не настроен")

    # Save pending payment first to get DB id
    payment_db = Payment(
        user_id=user.id,
        provider="yookassa",
        external_id="pending",
        amount_rub=plan.price_rub_month,
        status="pending",
        purpose="subscription",
        payload={"plan_id": plan_id, "user_id": str(user.id)},
    )
    db.add(payment_db)
    await db.flush()

    # Create YooKassa payment in thread (SDK is synchronous)
    db_payment_id = str(payment_db.id)
    plan_name = plan.name
    amount = plan.price_rub_month
    return_url = f"{settings.PAYMENT_RETURN_URL}?plan={plan_id}"
    idempotency_key = str(uuid.uuid4())

    def create_yk_payment():
        from yookassa import Configuration, Payment as YKPayment
        Configuration.account_id = settings.YOOKASSA_SHOP_ID
        Configuration.secret_key = settings.YOOKASSA_SECRET_KEY
        return YKPayment.create({
            "amount": {"value": f"{amount}.00", "currency": "RUB"},
            "confirmation": {"type": "redirect", "return_url": return_url},
            "description": f"Ghost AI — план {plan_name}",
            "metadata": {
                "payment_db_id": db_payment_id,
                "plan_id": plan_id,
                "user_id": str(user.id),
            },
            "capture": True,
        }, idempotency_key)

    try:
        yk = await asyncio.to_thread(create_yk_payment)
    except Exception as e:
        logger.error(f"YooKassa create error: {e}")
        await db.rollback()
        raise HTTPException(502, f"Ошибка платёжного провайдера: {e}")

    payment_db.external_id = yk.id
    await db.commit()

    return {
        "payment_id": db_payment_id,
        "payment_url": yk.confirmation.confirmation_url,
        "amount": amount,
        "plan": plan_name,
    }


# ─── Check payment status (polling fallback) ───────────────────────────────────

@router.get("/payment/{payment_id}/status")
async def payment_status(
    payment_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await db.get(Payment, payment_id)
    if not payment or payment.user_id != user.id:
        raise HTTPException(404, "Payment not found")

    # If still pending — check with YooKassa directly
    if payment.status == "pending" and settings.YOOKASSA_SHOP_ID and payment.external_id != "pending":
        yk_id = payment.external_id

        def check_yk():
            from yookassa import Configuration, Payment as YKPayment
            Configuration.account_id = settings.YOOKASSA_SHOP_ID
            Configuration.secret_key = settings.YOOKASSA_SECRET_KEY
            return YKPayment.find_one(yk_id)

        try:
            yk = await asyncio.to_thread(check_yk)
            if yk.status == "succeeded":
                payment.status = "completed"
                payment.completed_at = datetime.now(timezone.utc)
                plan_id = payment.payload.get("plan_id")
                if plan_id:
                    await _activate_subscription(db, payment.user_id, plan_id, str(payment.id))
                await db.commit()
            elif yk.status == "canceled":
                payment.status = "cancelled"
                await db.commit()
        except Exception as e:
            logger.warning(f"YK status check error: {e}")

    return {"status": payment.status, "plan_id": payment.payload.get("plan_id")}


# ─── YooKassa Webhook ──────────────────────────────────────────────────────────

@router.post("/webhook/yookassa")
async def yookassa_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    body = await request.json()
    event = body.get("event", "")
    obj = body.get("object", {})
    yk_id = obj.get("id")
    metadata = obj.get("metadata", {})

    logger.info(f"YK webhook: event={event} yk_id={yk_id}")

    if not yk_id:
        return {"ok": True}

    # Find payment by YooKassa id
    result = await db.execute(select(Payment).where(Payment.external_id == yk_id))
    payment = result.scalar_one_or_none()

    # Fallback: try metadata
    if not payment:
        db_id = metadata.get("payment_db_id")
        if db_id:
            payment = await db.get(Payment, db_id)

    if not payment:
        logger.warning(f"Payment not found for YK id {yk_id}")
        return {"ok": True}

    if event == "payment.succeeded" and payment.status != "completed":
        payment.status = "completed"
        payment.completed_at = datetime.now(timezone.utc)
        plan_id = payment.payload.get("plan_id")
        if plan_id and payment.purpose == "subscription":
            await _activate_subscription(db, payment.user_id, plan_id, str(payment.id))

    elif event == "payment.canceled" and payment.status == "pending":
        payment.status = "cancelled"

    await db.commit()
    return {"ok": True}


# ─── Internal: activate subscription + grant credits ──────────────────────────

async def _activate_subscription(db: AsyncSession, user_id, plan_id: str, payment_ref: str):
    plan = await db.get(Plan, plan_id)
    if not plan:
        return

    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=30)

    # Cancel existing active subscriptions
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.status == "active",
        )
    )
    for old in result.scalars().all():
        old.status = "cancelled"
        old.cancelled_at = now

    # New subscription
    db.add(Subscription(
        user_id=user_id,
        plan_id=plan_id,
        status="active",
        started_at=now,
        expires_at=expires,
        payment_ref=payment_ref,
        auto_renew=True,
    ))

    # Update user plan
    user = await db.get(User, user_id)
    if user:
        user.plan_id = plan_id

    # Grant credits
    wallet = await db.get(CreditsWallet, user_id)
    if wallet:
        wallet.monthly_quota = plan.credits_monthly
        wallet.monthly_quota_used = 0
        wallet.balance += plan.credits_monthly
        wallet.monthly_reset_at = expires
        db.add(CreditsLedger(
            user_id=user_id,
            amount=plan.credits_monthly,
            balance_after=wallet.balance,
            operation="subscription",
            ref_type="subscription",
            ref_id=payment_ref,
            description=f"Подписка {plan.name} — {plan.credits_monthly} кредитов",
        ))

    logger.info(f"Subscription activated: user={user_id} plan={plan_id} expires={expires}")
