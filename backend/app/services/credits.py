from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from fastapi import HTTPException
from app.models.models import CreditsWallet, CreditsLedger, Subscription


PLAN_ORDER = ["free", "starter", "pro", "creator", "elite"]

# Credit coefficients per 1k tokens
CREDIT_RATES = {
    "economy": 1,
    "premium": 8,
    "ultra": 20,
}

IMAGE_CREDITS = {
    "sd_512": 6,
    "sd_1024": 12,
    "dalle_hd": 25,
}

STT_CREDITS_PER_MINUTE = 2
TTS_CREDITS_PER_1K_CHARS = 3
RAG_INDEX_CREDITS = 5
RAG_QUERY_CREDITS = 4
VIDEO_CREDITS = 200


async def get_or_create_wallet(db: AsyncSession, user_id: str) -> CreditsWallet:
    wallet = await db.get(CreditsWallet, user_id)
    if not wallet:
        wallet = CreditsWallet(user_id=user_id, balance=15)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    return wallet


async def check_and_deduct(
    db: AsyncSession,
    user_id: str,
    amount: int,
    operation: str,
    ref_type: str = None,
    ref_id: str = None,
    description: str = None,
) -> int:
    """Check balance and deduct credits. Returns new balance."""
    wallet = await get_or_create_wallet(db, user_id)

    # Reset daily if needed
    now = datetime.now(timezone.utc)
    if wallet.daily_reset_at and wallet.daily_reset_at.date() < now.date():
        wallet.daily_used = 0
        wallet.daily_reset_at = now

    total_available = wallet.balance + wallet.bonus_balance

    if total_available < amount:
        raise HTTPException(402, detail={
            "error": "insufficient_credits",
            "balance": total_available,
            "required": amount,
        })

    # Deduct from bonus first, then main
    if wallet.bonus_balance >= amount:
        wallet.bonus_balance -= amount
    elif wallet.bonus_balance > 0:
        remaining = amount - wallet.bonus_balance
        wallet.bonus_balance = 0
        wallet.balance -= remaining
    else:
        wallet.balance -= amount

    wallet.daily_used += amount
    wallet.monthly_quota_used += amount
    wallet.updated_at = now

    new_balance = wallet.balance + wallet.bonus_balance

    # Ledger entry
    entry = CreditsLedger(
        user_id=user_id,
        amount=-amount,
        balance_after=new_balance,
        operation=operation,
        ref_type=ref_type,
        ref_id=ref_id,
        description=description,
    )
    db.add(entry)
    await db.commit()

    return new_balance


async def add_credits(
    db: AsyncSession,
    user_id: str,
    amount: int,
    operation: str,
    description: str = None,
    is_bonus: bool = False,
) -> int:
    wallet = await get_or_create_wallet(db, user_id)

    if is_bonus:
        wallet.bonus_balance += amount
    else:
        wallet.balance += amount

    new_balance = wallet.balance + wallet.bonus_balance

    entry = CreditsLedger(
        user_id=user_id,
        amount=amount,
        balance_after=new_balance,
        operation=operation,
        description=description,
    )
    db.add(entry)
    await db.commit()

    return new_balance


def estimate_llm_credits(tokens: int, tier: str) -> int:
    rate = CREDIT_RATES.get(tier, 1)
    return max(1, (tokens * rate) // 1000)


def estimate_tokens(text: str) -> int:
    """Rough estimate: ~4 chars per token"""
    return max(1, len(text) // 4)
