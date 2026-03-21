#!/bin/bash
# ============================================================
# Забрать все переменные окружения с Railway и сохранить в .env
# Требует: npm install -g @railway/cli  +  railway login
# ============================================================

set -e

OUTPUT_FILE="$(dirname "$0")/.env"

echo "=== Экспорт переменных с Railway ==="
echo ""

# Проверить railway CLI
if ! command -v railway &>/dev/null; then
    echo "❌ Railway CLI не найден. Установи:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Проверить авторизацию
if ! railway whoami &>/dev/null; then
    echo "❌ Не авторизован. Запусти:"
    echo "   railway login"
    exit 1
fi

echo "🔗 Текущий проект: $(railway status 2>/dev/null || echo 'неизвестно')"
echo ""

# -------------------------------------------------------
# Вариант 1 (рекомендуется): интерактивный вывод в файл
# -------------------------------------------------------
echo "📋 Выгружаем переменные..."

# railway variables выводит в формате KEY=VALUE
railway variables --json 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
# Railway возвращает {'SERVICE': {'KEY': 'VALUE'}}
# или просто {'KEY': 'VALUE'} в зависимости от версии CLI
if data and isinstance(list(data.values())[0], dict):
    # Несколько сервисов — берём первый или все
    for service, vars in data.items():
        print(f'# === {service} ===')
        for k, v in vars.items():
            v = str(v).replace('\n', '\\\\n')
            print(f'{k}={v}')
else:
    for k, v in data.items():
        v = str(v).replace('\n', '\\\\n')
        print(f'{k}={v}')
" > "$OUTPUT_FILE.railway_export"

if [ -s "$OUTPUT_FILE.railway_export" ]; then
    echo ""
    echo "✅ Переменные сохранены в: $OUTPUT_FILE.railway_export"
    echo ""
    echo "Проверь файл, затем:"
    echo "  cp $OUTPUT_FILE.railway_export $OUTPUT_FILE"
    echo ""
    echo "⚠️  Убедись что DATABASE_URL и REDIS_URL указывают на Docker-контейнеры:"
    echo "  DATABASE_URL=postgresql+asyncpg://ghost:PASS@postgres:5432/ghost_ai"
    echo "  REDIS_URL=redis://:PASS@redis:6379"
    cat "$OUTPUT_FILE.railway_export"
else
    echo ""
    echo "⚠️  Автоэкспорт не сработал — Railway CLI вернул пустой ответ."
    echo ""
    echo "Сделай вручную:"
    echo "  1. Открой https://railway.app → твой проект"
    echo "  2. Выбери сервис backend → Variables"
    echo "  3. Нажми 'Raw Editor' — скопируй всё в $OUTPUT_FILE"
    echo "  4. Повтори для сервиса bot (если отдельный)"
    echo ""
    echo "Потом замени URL'ы баз данных на Docker-внутренние:"
    echo "  DATABASE_URL=postgresql+asyncpg://ghost:PASS@postgres:5432/ghost_ai"
    echo "  REDIS_URL=redis://:PASS@redis:6379"
fi
