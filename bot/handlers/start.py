from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.filters.command import CommandObject
from aiogram.utils.keyboard import InlineKeyboardBuilder
from bot.core.config import BotConfig
from bot.core.api_client import get_user_token, api_get, api_post_plain

router = Router()
config = BotConfig()


@router.message(CommandStart())
async def cmd_start(message: types.Message, command: CommandObject):
    user = message.from_user

    # Handle deep link login from website
    if command.args and command.args.startswith("login_"):
        login_token = command.args[6:]
        try:
            await api_post_plain("/api/auth/telegram/login-confirm", {
                "token": login_token,
                "telegram_id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "admin_secret": config.ADMIN_SECRET_KEY,
            })
            await message.answer("✅ <b>Авторизация успешна!</b>\n\nВернитесь на сайт — вход выполнен автоматически.")
        except Exception:
            await message.answer("❌ Ссылка для входа устарела или уже использована.\nПопробуйте снова на сайте.")
        return

    # Auth with backend
    try:
        token = await get_user_token(user.id, user.username, user.first_name)
        balance_data = await api_get("/api/user/balance", token)
        balance = balance_data.get("total", 0)
        plan = balance_data.get("plan_id", "free")
    except Exception:
        balance = "?"
        plan = "free"

    builder = InlineKeyboardBuilder()
    builder.button(
        text="🚀 Открыть Ghost AI",
        web_app=types.WebAppInfo(url=config.MINIAPP_URL),
    )

    name = user.first_name or user.username or "Пользователь"

    await message.answer(
        f"👻 <b>Ghost AI</b>\n\n"
        f"Привет, {name}!\n\n"
        f"💳 Тариф: <b>{plan.upper()}</b>  |  💰 Кредиты: <b>{balance}</b>\n\n"
        f"Нажми кнопку ниже, чтобы открыть приложение 👇",
        reply_markup=builder.as_markup(),
    )


@router.message()
async def handle_any(message: types.Message):
    """Any message → redirect to miniapp"""
    builder = InlineKeyboardBuilder()
    builder.button(
        text="🚀 Открыть Ghost AI",
        web_app=types.WebAppInfo(url=config.MINIAPP_URL),
    )
    await message.reply(
        "Используй приложение для общения с AI 👇",
        reply_markup=builder.as_markup(),
    )
