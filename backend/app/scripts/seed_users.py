"""
Seed test users for development/testing.

Creates:
  - admin       (is_admin=True, Elite plan, 99999 credits)
  - test_pro    (Pro plan, 2500 credits)
  - test_free   (Free plan, 15 credits)

Run:
    python -m app.scripts.seed_users

After running, get JWT tokens:
    python -m app.scripts.seed_users --tokens
"""
import asyncio
import sys
import os
import uuid
from datetime import datetime, timezone, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

TEST_USERS = [
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "username": "admin",
        "email": "admin@ghostai.ru",
        "is_admin": True,
        "plan_id": "elite",
        "credits": 99999,
        "provider_user_id": "tg_admin_test",
    },
    {
        "id": "00000000-0000-0000-0000-000000000002",
        "username": "test_pro",
        "email": "pro@ghostai.ru",
        "is_admin": False,
        "plan_id": "pro",
        "credits": 2500,
        "provider_user_id": "tg_pro_test",
    },
    {
        "id": "00000000-0000-0000-0000-000000000003",
        "username": "test_free",
        "email": "free@ghostai.ru",
        "is_admin": False,
        "plan_id": "free",
        "credits": 15,
        "provider_user_id": "tg_free_test",
    },
]


async def seed_users():
    from app.core.database import AsyncSessionLocal, engine, Base
    from app.models.models import User, AuthIdentity, CreditsWallet, Subscription

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        for u in TEST_USERS:
            user_id = uuid.UUID(u["id"])

            existing = await db.get(User, user_id)
            if existing:
                print(f"  ⚠️  User '{u['username']}' already exists, skipping.")
                continue

            # Create user
            user = User(
                id=user_id,
                username=u["username"],
                email=u["email"],
                is_admin=u["is_admin"],
                is_active=True,
            )
            db.add(user)

            # Create auth identity (provider="test" for dev)
            identity = AuthIdentity(
                user_id=user_id,
                provider="test",
                provider_user_id=u["provider_user_id"],
                provider_data={"note": "seeded test account"},
            )
            db.add(identity)

            # Create wallet
            wallet = CreditsWallet(
                user_id=user_id,
                balance=u["credits"],
                bonus_balance=0,
                monthly_quota=u["credits"],
                monthly_quota_used=0,
                daily_used=0,
                monthly_reset_at=datetime.now(timezone.utc) + timedelta(days=30),
            )
            db.add(wallet)

            # Create active subscription
            sub = Subscription(
                user_id=user_id,
                plan_id=u["plan_id"],
                status="active",
                started_at=datetime.now(timezone.utc),
                expires_at=datetime.now(timezone.utc) + timedelta(days=365),
                auto_renew=False,
            )
            db.add(sub)

            print(f"  ✅ Created user '{u['username']}' (plan={u['plan_id']}, credits={u['credits']})")

        await db.commit()
        print("\n✅ Test users seeded!")


async def print_tokens():
    """Generate JWT tokens for test users so you can use them in browser/Postman."""
    from app.core.config import settings
    import jwt as pyjwt

    print("\n🔑 JWT Tokens for test users:\n")
    for u in TEST_USERS:
        payload = {
            "sub": u["id"],
            "jti": str(uuid.uuid4()),
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(days=30),
        }
        token = pyjwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
        print(f"  [{u['username']}]")
        print(f"  Authorization: Bearer {token}")
        print()


if __name__ == "__main__":
    asyncio.run(seed_users())
    if "--tokens" in sys.argv:
        asyncio.run(print_tokens())
