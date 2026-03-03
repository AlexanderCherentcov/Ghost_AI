from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from bot.core.api_client import get_user_token, stream_chat
import uuid

router = Router()


class ChatState(StatesGroup):
    active_mode = State()


@router.message(F.text & ~F.text.startswith("/"))
async def handle_message(message: types.Message, state: FSMContext):
    user = message.from_user

    data = await state.get_data()
    mode_id = data.get("mode_id", "general_chat")

    try:
        token = await get_user_token(user.id, user.username, user.first_name)
    except Exception:
        await message.reply("❌ Ошибка авторизации. Попробуйте /start")
        return

    # Send typing indicator
    await message.bot.send_chat_action(message.chat.id, "typing")

    # Stream response
    sent_message = None
    accumulated = ""
    request_id = str(uuid.uuid4())

    try:
        async for chunk_data in stream_chat(
            "/api/chat/send",
            token,
            {
                "mode_id": mode_id,
                "content": message.text,
                "request_id": request_id,
            },
        ):
            if chunk_data.get("error"):
                await message.reply(f"❌ {chunk_data['error']}")
                return

            if delta := chunk_data.get("delta"):
                accumulated += delta
                # Update message every ~100 chars to avoid rate limits
                if len(accumulated) % 150 == 0:
                    if sent_message:
                        try:
                            await sent_message.edit_text(accumulated + "▌")
                        except Exception:
                            pass
                    else:
                        sent_message = await message.reply(accumulated + "▌")

            if chunk_data.get("done"):
                credits = chunk_data.get("credits_used", 0)
                final_text = accumulated or "Готово!"
                if len(final_text) > 4090:
                    final_text = final_text[:4090] + "..."

                footer = f"\n\n<i>💰 -{credits} кредитов</i>"

                if sent_message:
                    await sent_message.edit_text(final_text + footer, parse_mode="HTML")
                else:
                    await message.reply(final_text + footer, parse_mode="HTML")
                return

    except Exception as e:
        error_text = str(e)
        if "insufficient_credits" in error_text:
            await message.reply("💳 Недостаточно кредитов. Пополните баланс: /plans")
        elif "plan_upgrade_required" in error_text:
            await message.reply("⬆️ Этот режим требует более высокого тарифа. /plans")
        else:
            await message.reply(f"❌ Ошибка: попробуйте ещё раз")

    if accumulated and not sent_message:
        await message.reply(accumulated)
