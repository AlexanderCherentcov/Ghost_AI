from aiogram import Router, types, F
from bot.core.api_client import get_user_token
import httpx

router = Router()


@router.message(F.voice)
async def handle_voice(message: types.Message):
    user = message.from_user

    try:
        token = await get_user_token(user.id, user.username, user.first_name)
    except Exception:
        await message.reply("❌ Ошибка авторизации")
        return

    await message.bot.send_chat_action(message.chat.id, "typing")
    processing_msg = await message.reply("🎤 Обрабатываю голосовое сообщение...")

    try:
        # Download voice
        file = await message.bot.get_file(message.voice.file_id)
        file_bytes = await message.bot.download_file(file.file_path)
        audio_data = file_bytes.read()

        # STT request
        from bot.core.config import BotConfig
        config = BotConfig()

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{config.API_BASE_URL}/api/voice/stt",
                headers={"Authorization": f"Bearer {token}", "X-Source": "tg_bot"},
                files={"audio": ("voice.ogg", audio_data, "audio/ogg")},
            )

            if resp.status_code == 402:
                await processing_msg.edit_text("💳 Недостаточно кредитов для STT")
                return
            if resp.status_code == 403:
                await processing_msg.edit_text("⬆️ STT доступен с тарифа Starter+")
                return

            resp.raise_for_status()
            result = resp.json()

        transcript = result["transcript"]
        credits = result["credits_used"]

        await processing_msg.edit_text(
            f"📝 <b>Транскрипт:</b>\n{transcript}\n\n"
            f"<i>💰 -{credits} кредитов</i>",
            parse_mode="HTML"
        )

    except Exception as e:
        await processing_msg.edit_text(f"❌ Ошибка STT: попробуйте ещё раз")
