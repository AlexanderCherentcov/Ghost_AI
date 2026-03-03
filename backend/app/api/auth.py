from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import json
from urllib.parse import urlencode

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_telegram_init_data, verify_telegram_web_auth
from app.schemas.schemas import TelegramMiniAppAuth, TelegramWebAuth, TelegramBotAuth, TokenResponse
from app.services.auth import upsert_user_by_identity, get_active_subscription

router = APIRouter()


@router.post("/telegram/bot")
async def telegram_bot_auth(data: TelegramBotAuth, db: AsyncSession = Depends(get_db)):
    """Auth from aiogram bot (server-to-server, uses ADMIN_SECRET_KEY)"""
    user, token = await upsert_user_by_identity(
        db=db,
        provider="telegram",
        provider_user_id=str(data.telegram_id),
        provider_data={
            "name": f"{data.first_name or ''} {data.username or ''}".strip(),
            "username": data.username,
            "first_name": data.first_name,
        },
    )
    plan_id = await get_active_subscription(db, str(user.id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "plan_id": plan_id,
        }
    }


@router.post("/telegram/miniapp")
async def telegram_miniapp_auth(data: TelegramMiniAppAuth, db: AsyncSession = Depends(get_db)):
    """Auth via Telegram Mini App initData"""
    try:
        parsed = verify_telegram_init_data(data.init_data)
    except Exception:
        raise HTTPException(401, "Invalid initData")

    user_data_str = parsed.get("user", "{}")
    tg_user = json.loads(user_data_str) if isinstance(user_data_str, str) else user_data_str

    user, token = await upsert_user_by_identity(
        db=db,
        provider="telegram",
        provider_user_id=str(tg_user.get("id")),
        provider_data={
            "name": f"{tg_user.get('first_name', '')} {tg_user.get('last_name', '')}".strip(),
            "username": tg_user.get("username"),
            "avatar_url": tg_user.get("photo_url"),
        },
    )
    plan_id = await get_active_subscription(db, str(user.id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "avatar_url": user.avatar_url,
            "plan_id": plan_id,
        }
    }


@router.post("/telegram/web")
async def telegram_web_auth(data: TelegramWebAuth, db: AsyncSession = Depends(get_db)):
    """Auth via Telegram Login Widget"""
    data_dict = data.dict()
    if not verify_telegram_web_auth(data_dict):
        raise HTTPException(401, "Invalid Telegram auth data or expired")

    user, token = await upsert_user_by_identity(
        db=db,
        provider="telegram",
        provider_user_id=str(data.id),
        provider_data={
            "name": f"{data.first_name or ''} {data.last_name or ''}".strip(),
            "username": data.username,
            "avatar_url": data.photo_url,
        },
    )
    plan_id = await get_active_subscription(db, str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": {"id": str(user.id), "username": user.username, "plan_id": plan_id}}


@router.get("/google/authorize")
async def google_authorize():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}")


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_resp.raise_for_status()
        tokens = token_resp.json()

        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()

    user, token = await upsert_user_by_identity(
        db=db,
        provider="google",
        provider_user_id=userinfo["id"],
        provider_data={
            "name": userinfo.get("name"),
            "avatar_url": userinfo.get("picture"),
        },
        email=userinfo.get("email"),
    )
    return RedirectResponse(f"{settings.MINIAPP_URL.replace('/app', '')}?token={token}")


@router.get("/yandex/authorize")
async def yandex_authorize():
    params = {
        "client_id": settings.YANDEX_CLIENT_ID,
        "redirect_uri": settings.YANDEX_REDIRECT_URI,
        "response_type": "code",
    }
    return RedirectResponse(f"https://oauth.yandex.ru/authorize?{urlencode(params)}")


@router.get("/yandex/callback")
async def yandex_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth.yandex.ru/token",
            data={
                "code": code,
                "client_id": settings.YANDEX_CLIENT_ID,
                "client_secret": settings.YANDEX_CLIENT_SECRET,
                "redirect_uri": settings.YANDEX_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_resp.raise_for_status()
        tokens = token_resp.json()

        userinfo_resp = await client.get(
            "https://login.yandex.ru/info?format=json",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()

    user, token = await upsert_user_by_identity(
        db=db,
        provider="yandex",
        provider_user_id=str(userinfo["id"]),
        provider_data={
            "name": userinfo.get("display_name"),
            "avatar_url": f"https://avatars.yandex.net/get-yapic/{userinfo.get('default_avatar_id', '')}/islands-200",
        },
        email=userinfo.get("default_email"),
    )
    return RedirectResponse(f"{settings.MINIAPP_URL.replace('/app', '')}?token={token}")


@router.post("/logout")
async def logout(request: Request, db: AsyncSession = Depends(get_db)):
    from fastapi.security import HTTPBearer
    from app.core.security import decode_access_token
    from app.core.redis import get_redis

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "No token")

    token = auth_header[7:]
    try:
        payload = decode_access_token(token)
        jti = payload.get("jti")
        exp = payload.get("exp", 0)
        import time
        ttl = max(1, int(exp - time.time()))
        redis = await get_redis()
        await redis.setex(f"blacklist:jti:{jti}", ttl, "1")
    except Exception:
        pass

    return {"message": "Logged out"}
