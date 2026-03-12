from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.utils.keyboard import InlineKeyboardBuilder

router = Router()

# All available modes with labels
MODES = [
    # Personas
    ("persona_gpt4o",    "🟢 GPT-4o стиль"),
    ("persona_gpt4mini", "⚡ GPT-4o mini стиль"),
    ("persona_claude",   "🟠 Claude стиль"),
    ("persona_gemini",   "🔵 Gemini стиль"),
    # Chat
    ("general_chat",     "💬 Общий чат"),
    ("code_assistant",   "💻 Код"),
    ("code_review",      "🔍 Код-ревью"),
    ("debug_helper",     "🐛 Отладка"),
    ("gpt4_smart",       "🧠 GPT-4 Smart"),
    # Content
    ("copywriter",       "✍️ Копирайтер"),
    ("translator",       "🌐 Переводчик"),
    ("summarizer",       "📝 Краткий пересказ"),
    ("email_writer",     "📧 Письма"),
    # Business
    ("business_analyst", "📊 Бизнес-аналитик"),
    ("legal_assistant",  "⚖️ Юрист"),
    # Creative
    ("prompt_engineer",  "🎨 Промпты"),
    ("brainstorm",       "⚡ Брейншторм"),
]

MODE_NAMES = {m[0]: m[1] for m in MODES}


@router.message(Command("mode"))
async def cmd_mode(message: types.Message, state: FSMContext):
    data = await state.get_data()
    current = data.get("mode_id", "general_chat")
    current_name = MODE_NAMES.get(current, current)

    builder = InlineKeyboardBuilder()
    for mode_id, label in MODES:
        check = "✅ " if mode_id == current else ""
        builder.button(text=f"{check}{label}", callback_data=f"setmode:{mode_id}")
    builder.adjust(2)

    await message.answer(
        f"🎭 <b>Выберите режим</b>\n\n"
        f"Текущий: <b>{current_name}</b>\n\n"
        f"Режим определяет стиль и поведение ИИ в диалоге.",
        reply_markup=builder.as_markup(),
    )


@router.callback_query(lambda c: c.data and c.data.startswith("setmode:"))
async def set_mode(callback: types.CallbackQuery, state: FSMContext):
    mode_id = callback.data.split(":", 1)[1]
    label = MODE_NAMES.get(mode_id, mode_id)

    await state.update_data(mode_id=mode_id)

    await callback.message.edit_text(
        f"✅ Режим переключён: <b>{label}</b>\n\n"
        f"Начинайте диалог — история предыдущего режима сохранена.",
    )
    await callback.answer()
