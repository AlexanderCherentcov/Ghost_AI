from aiogram import Router, types, F
router = Router()

@router.message(F.photo)
async def handle_photo(message: types.Message):
    await message.reply("📸 Для работы с изображениями откройте Mini App: /start")
