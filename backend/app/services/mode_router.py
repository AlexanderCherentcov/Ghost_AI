from dataclasses import dataclass
from typing import Optional, List
import logging

from app.core.redis import get_redis
from app.services.credits import estimate_llm_credits, estimate_tokens, CREDIT_RATES

logger = logging.getLogger(__name__)

PLAN_ORDER = ["free", "starter", "pro", "creator", "elite"]

CIRCUIT_BREAKER_ERRORS_THRESHOLD = 5
CIRCUIT_BREAKER_TIMEOUT = 60


@dataclass
class RoutingDecision:
    provider: str
    model: str
    estimated_cost: int
    tier: str
    can_proceed: bool
    deny_reason: Optional[str] = None


async def route_request(
    mode: dict,
    plan_id: str,
    credits_available: int,
    content: str,
) -> RoutingDecision:
    policy = mode["model_policy"]
    price_policy = mode["price_policy"]

    # 1. Check plan access
    min_plan = mode.get("min_plan", "free")
    if PLAN_ORDER.index(plan_id) < PLAN_ORDER.index(min_plan):
        return RoutingDecision(
            provider="", model="", estimated_cost=0, tier="",
            can_proceed=False, deny_reason="plan_upgrade_required"
        )

    # 2. Determine tier
    desired_tier = policy.get("tier", "economy")

    # 3. Downgrade if plan doesn't support premium
    if desired_tier == "premium" and plan_id in ["free", "starter"]:
        desired_tier = "economy"

    # 4. Estimate cost
    input_tokens = estimate_tokens(content)
    # Add estimated output tokens
    max_tokens = policy.get("max_tokens", 2048)
    total_tokens = input_tokens + (max_tokens // 2)

    estimated_cost = price_policy.get("base_credits", 0) + estimate_llm_credits(total_tokens, desired_tier)

    # 5. Budget check with fallback
    if estimated_cost > credits_available:
        if desired_tier == "premium":
            desired_tier = "economy"
            estimated_cost = price_policy.get("base_credits", 0) + estimate_llm_credits(total_tokens, "economy")

        if estimated_cost > credits_available:
            return RoutingDecision(
                provider="", model="", estimated_cost=estimated_cost, tier="",
                can_proceed=False, deny_reason="insufficient_credits"
            )

    # 6. Select provider
    model_candidates = policy.get(f"{desired_tier}_models", [])
    fallback_models = policy.get("fallback", [])

    provider, model = await _select_healthy_provider(model_candidates + fallback_models)
    if not provider:
        # Last resort fallback
        return RoutingDecision(
            provider="", model="", estimated_cost=0, tier="",
            can_proceed=False, deny_reason="no_providers_available"
        )

    return RoutingDecision(
        provider=provider,
        model=model,
        estimated_cost=estimated_cost,
        tier=desired_tier,
        can_proceed=True,
    )


async def _select_healthy_provider(candidates: List[str]) -> tuple:
    redis = await get_redis()
    for candidate in candidates:
        if "/" in candidate:
            provider, model = candidate.split("/", 1)
        else:
            provider, model = candidate, candidate

        status = await redis.get(f"cb:provider:{provider}")
        if status != "open":
            return provider, model

    return None, None


async def record_provider_error(provider: str):
    redis = await get_redis()
    key = f"cb:errors:{provider}"
    errors = await redis.incr(key)
    await redis.expire(key, 120)
    if int(errors) >= CIRCUIT_BREAKER_ERRORS_THRESHOLD:
        await redis.setex(f"cb:provider:{provider}", CIRCUIT_BREAKER_TIMEOUT, "open")
        logger.warning(f"Circuit breaker OPEN for provider: {provider}")


async def record_provider_success(provider: str):
    redis = await get_redis()
    await redis.delete(f"cb:errors:{provider}")
    await redis.delete(f"cb:provider:{provider}")
