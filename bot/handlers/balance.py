from aiogram import Router, types
from aiogram.filters import Command
router = Router()

@router.message(Command("balance"))
async def cmd_balance(message: types.Message):
    from bot.core.api_client import get_user_token, api_get
    user = message.from_user
    try:
        token = await get_user_token(user.id, user.username, user.first_name)
        data = await api_get("/api/user/balance", token)
        await message.reply(
            f"💰 <b>Баланс:</b> {data['total']} кредитов\n"
            f"📊 <b>Тариф:</b> {data['plan_id'].upper()}\n"
            f"📅 <b>Использовано сегодня:</b> {data['daily_used']}",
            parse_mode="HTML"
        )
    except Exception:
        await message.reply("❌ Ошибка получения баланса")
