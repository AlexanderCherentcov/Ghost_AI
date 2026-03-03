"""
Seed script: creates plans and loads modes from modes.json
Run: python -m app.scripts.seed
"""
import asyncio
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))


async def seed():
    from app.core.database import AsyncSessionLocal, engine, Base
    from app.models.models import Plan, Mode

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        # Seed Plans
        plans = [
            Plan(
                id="free",
                name="Free",
                price_rub_month=0,
                credits_monthly=15,
                credits_daily_limit=15,
                max_file_size_mb=0,
                max_context_msgs=5,
                max_documents=0,
                features={"image_gen": False, "voice": False, "rag": False, "video": False},
                sort_order=0,
            ),
            Plan(
                id="starter",
                name="Starter",
                price_rub_month=490,
                credits_monthly=800,
                credits_daily_limit=100,
                max_file_size_mb=10,
                max_context_msgs=10,
                max_documents=0,
                features={"image_gen": False, "voice": True, "rag": False, "video": False, "voice_stt_only": True},
                sort_order=1,
            ),
            Plan(
                id="pro",
                name="Pro",
                price_rub_month=890,
                credits_monthly=2500,
                credits_daily_limit=300,
                max_file_size_mb=25,
                max_context_msgs=20,
                max_documents=3,
                features={"image_gen": True, "image_max_px": 512, "voice": True, "rag": True, "video": False},
                sort_order=2,
            ),
            Plan(
                id="creator",
                name="Creator",
                price_rub_month=1690,
                credits_monthly=8000,
                credits_daily_limit=600,
                max_file_size_mb=50,
                max_context_msgs=40,
                max_documents=20,
                features={"image_gen": True, "image_max_px": 1024, "voice": True, "rag": True, "video": False},
                sort_order=3,
            ),
            Plan(
                id="elite",
                name="Elite",
                price_rub_month=5990,
                credits_monthly=40000,
                credits_daily_limit=3000,
                max_file_size_mb=100,
                max_context_msgs=100,
                max_documents=100,
                features={"image_gen": True, "image_max_px": 1024, "voice": True, "rag": True, "video": True, "api_access": True, "priority": True},
                sort_order=4,
            ),
        ]

        for plan in plans:
            existing = await db.get(Plan, plan.id)
            if not existing:
                db.add(plan)

        # Load modes from JSON
        modes_file = os.path.join(os.path.dirname(__file__), "../../../modes/modes.json")
        if os.path.exists(modes_file):
            with open(modes_file, "r", encoding="utf-8") as f:
                modes_data = json.load(f)

            for m in modes_data:
                existing = await db.get(Mode, m["id"])
                if not existing:
                    mode = Mode(
                        id=m["id"],
                        title=m["title"],
                        description=m.get("description"),
                        category=m["category"],
                        icon_emoji=m.get("icon_emoji"),
                        system_prompt=m["system_prompt"],
                        model_policy=m["model_policy"],
                        price_policy=m["price_policy"],
                        min_plan=m.get("min_plan", "free"),
                        is_active=m.get("is_active", True),
                        sort_order=m.get("sort_order", 0),
                    )
                    db.add(mode)

        await db.commit()
        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
