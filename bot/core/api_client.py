import httpx
from bot.core.config import BotConfig

config = BotConfig()


async def get_user_token(telegram_id: int, username: str = None, first_name: str = None) -> str:
    """Auth user via bot and get JWT token"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{config.API_BASE_URL}/api/auth/telegram/bot",
            json={
                "telegram_id": telegram_id,
                "username": username,
                "first_name": first_name,
            },
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


async def api_get(path: str, token: str, **params) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{config.API_BASE_URL}{path}",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )
        resp.raise_for_status()
        return resp.json()


async def api_post(path: str, token: str, data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{config.API_BASE_URL}{path}",
            headers={"Authorization": f"Bearer {token}"},
            json=data,
        )
        resp.raise_for_status()
        return resp.json()


async def stream_chat(path: str, token: str, data: dict):
    """Stream SSE response from API"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{config.API_BASE_URL}{path}",
            headers={"Authorization": f"Bearer {token}", "X-Source": "tg_bot"},
            json=data,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    import json
                    try:
                        yield json.loads(line[6:])
                    except Exception:
                        continue
