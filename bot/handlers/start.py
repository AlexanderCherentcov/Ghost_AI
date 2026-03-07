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
        login_token = command.args[6:]  # strip "login_"
        try:
            await api_post_plain("/api/auth/telegram/login-confirm", {
                "token": login_token,
                "telegram_id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "admin_secret": config.ADMIN_SECRET_KEY,
            })
            await message.answer(
                "✅ <b>Авторизация успешна!</b>\n\n"
                "Вернитесь на сайт — вход выполнен автоматически.",
            )
        except Exception:
            await message.answer(
                "❌ Ссылка для входа устарела или уже использована.\n"
                "Попробуйте снова на сайте.",
            )
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
    builder.button(text="💰 Баланс", callback_data="balance")
    builder.button(text="💳 Тарифы", callback_data="plans")
    builder.adjust(1, 2)

    name = user.first_name or user.username or "Пользователь"

    await message.answer(
        f"👻 <b>Ghost AI</b>\n\n"
        f"Привет, {name}!\n\n"
        f"🤖 90 AI-режимов в одном месте:\n"
        f"• Текст и код с GPT-4\n"
        f"• Генерация изображений\n"
        f"• Анализ документов (RAG)\n"
        f"• Голосовой ввод и синтез речи\n\n"
        f"💳 Тариф: <b>{plan.upper()}</b>\n"
        f"💰 Кредиты: <b>{balance}</b>\n\n"
        f"Нажми кнопку ниже, чтобы начать 👇",
        reply_markup=builder.as_markup(),
    )


@router.callback_query(lambda c: c.data == "balance")
async def show_balance(callback: types.CallbackQuery):
    user = callback.from_user
    try:
        token = await get_user_token(user.id, user.username, user.first_name)
        data = await api_get("/api/user/balance", token)
        text = (
            f"💰 <b>Ваш баланс</b>\n\n"
            f"Основной: <b>{data['balance']}</b> кредитов\n"
            f"Бонусный: <b>{data['bonus_balance']}</b> кредитов\n"
            f"Итого: <b>{data['total']}</b>\n\n"
            f"📊 Тариф: <b>{data['plan_id'].upper()}</b>\n"
            f"📅 Использовано за день: {data['daily_used']}"
            + (f" / {data['daily_limit']}" if data.get('daily_limit') else "")
        )
    except Exception as e:
        text = f"❌ Ошибка получения баланса: {str(e)[:100]}"

    await callback.message.edit_text(text, parse_mode="HTML")
    await callback.answer()


@router.callback_query(lambda c: c.data == "plans")
async def show_plans(callback: types.CallbackQuery):
    text = (
        "💳 <b>Тарифы Ghost AI</b>\n\n"
        "🆓 <b>Free</b> — 0 ₽\n"
        "15 кредитов · Базовый чат\n\n"
        "⚡ <b>Starter</b> — 490 ₽/мес\n"
        "800 кредитов/мес · 40 режимов · STT\n\n"
        "🚀 <b>Pro</b> — 890 ₽/мес\n"
        "2500 кредитов/мес · 75 режимов · Изображения · RAG\n\n"
        "🎨 <b>Creator</b> — 1690 ₽/мес\n"
        "8000 кредитов/мес · Все 90 режимов · HD изображения\n\n"
        "👑 <b>Elite</b> — 5990 ₽/мес\n"
        "40000 кредитов/мес · Видео · Приоритет · API\n\n"
        "Оформить подписку: ghostai.ru"
    )
    await callback.message.edit_text(text, parse_mode="HTML")
    await callback.answer()
