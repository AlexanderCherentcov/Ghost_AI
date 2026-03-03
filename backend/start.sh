#!/bin/sh
set -e

echo "=== Running migrations ==="
alembic upgrade head

echo "=== Seeding database ==="
python -m app.scripts.seed

echo "=== Starting server ==="
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
