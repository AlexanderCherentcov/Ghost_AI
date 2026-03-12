import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.redis import RedisStorage
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from bot.core.config import BotConfig
from bot.handlers import start

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    config = BotConfig()
    try:
        storage = RedisStorage.from_url(config.REDIS_URL)
        logger.info("Using Redis storage")
    except Exception as e:
        logger.warning(f"Redis unavailable ({e}), falling back to MemoryStorage")
        storage = MemoryStorage()

    bot = Bot(
        token=config.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher(storage=storage)

    dp.include_router(start.router)

    logger.info("Ghost AI Bot starting...")
    await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())


if __name__ == "__main__":
    asyncio.run(main())
