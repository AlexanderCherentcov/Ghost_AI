from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from bot.core.api_client import get_user_token, stream_chat
from bot.core.config import BotConfig
import httpx
import uuid

router = Router()
config = BotConfig()


@router.message(F.voice)
async def handle_voice(message: types.Message, state: FSMContext):
    user = message.from_user

    try:
        token = await get_user_token(user.id, user.username, user.first_name)
    except Exception:
        await message.reply("❌ Ошибка авторизации. Попробуйте /start")
        return

    await message.bot.send_chat_action(message.chat.id, "typing")
    processing_msg = await message.reply("🎤 Распознаю речь…")

    try:
        # Download voice file
        file = await message.bot.get_file(message.voice.file_id)
        file_bytes = await message.bot.download_file(file.file_path)
        audio_data = file_bytes.read()

        # STT request
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{config.API_BASE_URL}/api/voice/stt",
                headers={"Authorization": f"Bearer {token}", "X-Source": "tg_bot"},
                files={"audio": ("voice.ogg", audio_data, "audio/ogg")},
            )

            if resp.status_code == 402:
                await processing_msg.edit_text("💳 Недостаточно кредитов для распознавания речи")
                return
            if resp.status_code == 403:
                await processing_msg.edit_text("⬆️ Распознавание речи доступно с тарифа Starter+")
                return

            resp.raise_for_status()
            result = resp.json()

        transcript = result.get("transcript", "").strip()
        if not transcript:
            await processing_msg.edit_text("❌ Не удалось распознать речь. Попробуйте ещё раз.")
            return

        # Show transcript and send to chat
        await processing_msg.edit_text(f"🎤 <i>{transcript}</i>")

        # Get mode from state and send as chat message
        data = await state.get_data()
        mode_id = data.get("mode_id", "general_chat")

        await message.bot.send_chat_action(message.chat.id, "typing")

        sent_msg = None
        accumulated = ""
        request_id = str(uuid.uuid4())

        async for chunk_data in stream_chat(
            "/api/chat/send",
            token,
            {"mode_id": mode_id, "content": transcript, "request_id": request_id},
        ):
            if chunk_data.get("error"):
                await message.reply(f"❌ {chunk_data['error']}")
                return

            if delta := chunk_data.get("delta"):
                accumulated += delta
                if len(accumulated) % 150 == 0:
                    if sent_msg:
                        try:
                            await sent_msg.edit_text(accumulated + "▌")
                        except Exception:
                            pass
                    else:
                        sent_msg = await message.reply(accumulated + "▌")

            if chunk_data.get("done"):
                credits = chunk_data.get("credits_used", 0)
                final_text = accumulated or "Готово!"
                if len(final_text) > 4090:
                    final_text = final_text[:4090] + "…"
                footer = f"\n\n<i>💰 -{credits} кредитов</i>"
                if sent_msg:
                    await sent_msg.edit_text(final_text + footer, parse_mode="HTML")
                else:
                    await message.reply(final_text + footer, parse_mode="HTML")
                return

    except Exception:
        await processing_msg.edit_text("❌ Ошибка. Попробуйте ещё раз или напишите текстом.")
