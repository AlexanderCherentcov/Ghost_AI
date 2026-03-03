# 👻 Ghost AI

> AI-агрегатор с 90 режимами — Telegram Bot + Mini App + Web Platform

## Стек

| Компонент | Технология |
|-----------|------------|
| Backend API | FastAPI 0.115 + Python 3.12 |
| Database | PostgreSQL 16 + pgvector |
| Cache & Queue | Redis 7 + Arq |
| Telegram Bot | aiogram 3.14 |
| Mini App | React 18 + TypeScript + Vite |
| Web | Next.js 14 App Router |
| Deploy | Docker Compose + Nginx |

## Быстрый старт

```bash
# 1. Клонировать и настроить
cd infra
cp .env.example .env
# Заполнить .env своими ключами!

# 2. Развернуть
chmod +x deploy.sh
./deploy.sh --migrate

# 3. Проверить
curl http://localhost:8000/health
```

## Структура проекта

```
ghost-ai/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # Роуты (auth, chat, image, docs, voice, admin)
│   │   ├── core/     # Config, DB, Redis, Security
│   │   ├── models/   # SQLAlchemy ORM
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic + providers
│   │   └── workers/  # Arq async tasks
│   └── alembic/      # DB migrations
│
├── bot/              # Telegram Bot (aiogram 3)
├── miniapp/          # React Mini App (Vite)
├── web/              # Next.js Web (App Router)
├── infra/            # Docker Compose + Nginx + deploy
└── modes/            # modes.json — 90 режимов
```

## API Endpoints

### Auth
```
POST /api/auth/telegram/bot       - Bot auth
POST /api/auth/telegram/miniapp   - Mini App initData auth
POST /api/auth/telegram/web       - Telegram Login Widget
GET  /api/auth/google/authorize   - Google OAuth
GET  /api/auth/google/callback
GET  /api/auth/yandex/authorize   - Yandex OAuth
GET  /api/auth/yandex/callback
POST /api/auth/logout
```

### User
```
GET  /api/user/me
GET  /api/user/balance
GET  /api/user/usage
```

### Chat (SSE streaming)
```
GET  /api/chat/modes
POST /api/chat/send          ← Server-Sent Events
GET  /api/chat/history
DEL  /api/chat/history/:mode_id
```

### Image
```
POST /api/image/generate     ← Async task
GET  /api/image/status/:id
```

### Docs (RAG)
```
POST /api/docs/upload
GET  /api/docs
GET  /api/docs/:id/status
POST /api/docs/query         ← SSE streaming
DEL  /api/docs/:id
```

### Voice
```
POST /api/voice/stt
POST /api/voice/tts
GET  /api/voice/tts/status/:id
```

### Plans
```
GET  /api/plans
POST /api/plans/subscribe
```

### Admin
```
GET  /api/admin/users
POST /api/admin/users/:id/grant
POST /api/admin/users/:id/ban
GET  /api/admin/stats
GET  /api/admin/logs
PATCH /api/admin/modes/:id
```

## Тарифы

| Тариф | Цена | Кредиты/мес |
|-------|------|-------------|
| Free | 0 ₽ | 15 (разово) |
| Starter | 490 ₽ | 800 |
| Pro | 890 ₽ | 2 500 |
| Creator | 1 690 ₽ | 8 000 |
| Elite | 5 990 ₽ | 40 000 |

## Коэффициенты кредитов

| Тип | Стоимость |
|-----|-----------|
| Economy LLM | 1 кред / 1k токенов |
| Premium LLM | 8 кред / 1k токенов |
| Изображение 512px | 6 кредитов |
| Изображение 1024px | 12 кредитов |
| STT Whisper | 2 кред / мин |
| TTS синтез | 3 кред / 1k символов |
| RAG индексация | 5 кред / документ |
| RAG запрос | 4 кред + LLM |

## Разработка

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Mini App
cd miniapp
npm install
npm run dev

# Web
cd web
npm install
npm run dev

# Bot
cd bot
pip install -r requirements.txt
python -m bot.main
```

## Спринт-план (MVP ~10 недель)

- **Sprint 1** (2 нед): Auth + Text chat + Credits
- **Sprint 2** (2 нед): Web OAuth + Payments + Admin
- **Sprint 3** (2 нед): Image generation + Arq workers
- **Sprint 4** (2 нед): RAG documents
- **Sprint 5** (2 нед): Voice STT/TTS + Monitoring

## Переменные окружения

Заполнить в `infra/.env`:
- `BOT_TOKEN` — из @BotFather
- `LLM_PREMIUM_API_KEY` — OpenAI или совместимый
- `LLM_ECONOMY_API_KEY` — Together AI / Groq
- `IMAGE_API_KEY` — Stability AI
- `GOOGLE_CLIENT_ID/SECRET` — Google Cloud Console
- `YANDEX_CLIENT_ID/SECRET` — oauth.yandex.ru
- `YOOKASSA_SHOP_ID/SECRET` — ЮKassa
