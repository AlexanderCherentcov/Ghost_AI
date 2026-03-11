import logging
from fastapi import APIRouter, Depends, HTTPException, Request

logger = logging.getLogger(__name__)
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import json
import uuid
import time
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.models import User, Mode, Message, ProviderRequest
from app.api.deps import get_current_user
from app.schemas.schemas import ChatSendRequest
from app.services.auth import get_active_subscription
from app.services.credits import check_and_deduct, get_or_create_wallet, estimate_tokens
from app.services.mode_router import route_request, record_provider_error, record_provider_success
from app.services.providers.llm_openai import get_premium_provider, get_economy_provider
from app.services.rate_limit import rate_limit_middleware

router = APIRouter()


@router.get("/modes")
async def list_modes(
    category: str = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan_id = await get_active_subscription(db, str(user.id))
    query = select(Mode).where(Mode.is_active == True).order_by(Mode.sort_order)
    if category:
        query = query.where(Mode.category == category)

    result = await db.execute(query)
    modes = result.scalars().all()

    from app.services.mode_router import PLAN_ORDER

    return [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "category": m.category,
            "icon_emoji": m.icon_emoji,
            "min_plan": m.min_plan,
            "is_locked": PLAN_ORDER.index(plan_id) < PLAN_ORDER.index(m.min_plan),
            "sort_order": m.sort_order,
        }
        for m in modes
    ]


@router.post("/send")
async def chat_send(
    request_data: ChatSendRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await rate_limit_middleware(request, str(user.id))

    if user.is_shadow_banned:
        # Return fake response for shadow-banned users
        async def fake_stream():
            yield f"data: {json.dumps({'delta': 'Понял вас!'})}\n\n"
            yield f"data: {json.dumps({'done': True, 'credits_used': 0})}\n\n"
        return StreamingResponse(fake_stream(), media_type="text/event-stream")

    # Get mode
    mode = await db.get(Mode, request_data.mode_id)
    if not mode or not mode.is_active:
        raise HTTPException(404, "Mode not found")

    plan_id = await get_active_subscription(db, str(user.id))
    wallet = await get_or_create_wallet(db, str(user.id))
    credits_available = wallet.balance + wallet.bonus_balance

    # Route request
    decision = await route_request(
        mode={"id": mode.id, "model_policy": mode.model_policy, "price_policy": mode.price_policy, "min_plan": mode.min_plan},
        plan_id=plan_id,
        credits_available=credits_available,
        content=request_data.content,
    )

    if not decision.can_proceed:
        raise HTTPException(
            402 if decision.deny_reason == "insufficient_credits" else 403,
            detail={"error": decision.deny_reason}
        )

    # Get chat history
    plan_result = await db.execute(select(Mode).where(Mode.id == request_data.mode_id))
    from app.models.models import Plan
    plan = await db.get(Plan, plan_id)
    max_context = plan.max_context_msgs if plan else 10

    history_result = await db.execute(
        select(Message)
        .where(Message.user_id == user.id, Message.mode_id == mode.id)
        .order_by(Message.created_at.desc())
        .limit(max_context)
    )
    history = list(reversed(history_result.scalars().all()))

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": request_data.content})

    # Save user message
    user_msg = Message(
        user_id=user.id,
        mode_id=mode.id,
        role="user",
        content=request_data.content,
        source=request.headers.get("X-Source", "web"),
    )
    db.add(user_msg)
    await db.commit()

    request_id = request_data.request_id or str(uuid.uuid4())

    async def generate():
        start_time = time.time()
        full_response = ""
        tokens_in = 0
        tokens_out = 0
        status = "success"
        error_code = None

        try:
            if decision.tier == "premium":
                provider = get_premium_provider()
            else:
                provider = get_economy_provider()

            async for chunk in provider.chat_stream(
                messages=messages,
                model=decision.model,
                max_tokens=mode.model_policy.get("max_tokens", 2048),
                system_prompt=mode.system_prompt,
            ):
                full_response += chunk
                yield f"data: {json.dumps({'delta': chunk})}\n\n"

            tokens_in = estimate_tokens(request_data.content)
            tokens_out = estimate_tokens(full_response)
            await record_provider_success(decision.provider)

        except Exception as e:
            error_code = "provider_error"
            status = "error"
            logger.error("Provider error [%s / %s]: %s", decision.provider, decision.model, e, exc_info=True)
            await record_provider_error(decision.provider)
            yield f"data: {json.dumps({'error': f'Provider error: {type(e).__name__}: {e}'})}\n\n"
            full_response = str(e)

        latency_ms = int((time.time() - start_time) * 1000)

        # Calculate actual credits
        from app.services.credits import estimate_llm_credits
        actual_cost = estimate_llm_credits(tokens_in + tokens_out, decision.tier)

        # Deduct credits
        try:
            await check_and_deduct(
                db=db,
                user_id=str(user.id),
                amount=actual_cost,
                operation="charge",
                ref_type="provider_request",
                ref_id=request_id,
                description=f"Chat: {mode.title}",
            )
        except HTTPException:
            actual_cost = 0

        # Save assistant message
        ai_msg = Message(
            user_id=user.id,
            mode_id=mode.id,
            role="assistant",
            content=full_response,
            credits_charged=actual_cost,
            source=request.headers.get("X-Source", "web"),
        )
        db.add(ai_msg)

        # Log provider request
        pr = ProviderRequest(
            request_id=uuid.UUID(request_id) if len(request_id) == 36 else uuid.uuid4(),
            user_id=user.id,
            mode_id=mode.id,
            source=request.headers.get("X-Source", "web"),
            provider=decision.provider,
            model=decision.model,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            credits_charged=actual_cost,
            latency_ms=latency_ms,
            status=status,
            error_code=error_code,
        )
        db.add(pr)
        await db.commit()

        yield f"data: {json.dumps({'done': True, 'credits_used': actual_cost, 'tokens_in': tokens_in, 'tokens_out': tokens_out})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/history")
async def chat_history(
    mode_id: str = None,
    page: int = 1,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    query = select(Message).where(Message.user_id == user.id)
    count_query = select(func.count()).select_from(Message).where(Message.user_id == user.id)

    if mode_id:
        query = query.where(Message.mode_id == mode_id)
        count_query = count_query.where(Message.mode_id == mode_id)

    query = query.order_by(Message.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    messages = result.scalars().all()

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    return {
        "messages": [
            {
                "id": str(m.id),
                "mode_id": m.mode_id,
                "role": m.role,
                "content": m.content,
                "credits_charged": m.credits_charged,
                "created_at": m.created_at,
            }
            for m in reversed(messages)
        ],
        "total": total,
        "has_more": (offset + limit) < total,
    }


@router.delete("/history/{mode_id}")
async def clear_history(
    mode_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import delete
    await db.execute(
        delete(Message).where(Message.user_id == user.id, Message.mode_id == mode_id)
    )
    await db.commit()
    return {"message": "History cleared"}
