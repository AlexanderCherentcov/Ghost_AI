#!/bin/bash
# ============================================
# Ghost AI — Deploy Script
# Usage: ./deploy.sh [--pull] [--migrate]
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Ghost AI Deploy"
echo "================================"

# Check .env exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ .env not found! Copy .env.example to .env and fill in values."
    echo "   cp $SCRIPT_DIR/.env.example $SCRIPT_DIR/.env"
    exit 1
fi

cd "$SCRIPT_DIR"

# Pull latest if requested
if [[ "$*" == *"--pull"* ]]; then
    echo "📦 Pulling latest changes..."
    git -C "$PROJECT_DIR" pull
fi

# Build and start
echo "🔨 Building containers..."
docker compose build --no-cache

echo "🏃 Starting services..."
docker compose up -d

# Wait for API
echo "⏳ Waiting for API to start..."
sleep 10

# Run migrations if requested or first deploy
if [[ "$*" == *"--migrate"* ]]; then
    echo "🗄️  Running migrations..."
    docker compose exec api alembic upgrade head
    docker compose exec api python -m app.scripts.seed
fi

echo ""
echo "✅ Ghost AI deployed!"
echo ""
echo "Services:"
docker compose ps
echo ""
echo "📊 Logs: docker compose -f $SCRIPT_DIR/docker-compose.yml logs -f api"
