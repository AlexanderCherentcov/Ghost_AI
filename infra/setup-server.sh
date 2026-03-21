#!/bin/bash
# ============================================================
# Ghost AI — Первоначальная настройка сервера
# Запускать от root или через sudo на 178.217.101.193
#
# БЕЗОПАСНО: не трогает WireGuard (wg0) и X-ray
# ============================================================

set -e

REPO_URL="https://github.com/YOUR_ORG/ghost-ai.git"   # <-- замени
APP_DIR="/opt/ghost-ai"
DEPLOY_USER="ghost"

echo "======================================"
echo " Ghost AI — Server Setup"
echo "======================================"

# --- 1. Обновить систему ---
echo "[1/7] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# --- 2. Установить Docker ---
if ! command -v docker &>/dev/null; then
    echo "[2/7] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[2/7] Docker already installed — skipping"
fi

# --- 3. Установить Docker Compose plugin ---
if ! docker compose version &>/dev/null; then
    echo "[3/7] Installing Docker Compose plugin..."
    apt-get install -y -qq docker-compose-plugin
else
    echo "[3/7] Docker Compose already installed — skipping"
fi

# --- 4. Создать деплой-пользователя ---
if ! id "$DEPLOY_USER" &>/dev/null; then
    echo "[4/7] Creating user '$DEPLOY_USER'..."
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
else
    echo "[4/7] User '$DEPLOY_USER' already exists — skipping"
    usermod -aG docker "$DEPLOY_USER"
fi

# --- 5. Клонировать репозиторий ---
echo "[5/7] Cloning repository..."
if [ ! -d "$APP_DIR" ]; then
    git clone "$REPO_URL" "$APP_DIR"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
else
    echo "  Repo already cloned at $APP_DIR — pulling latest..."
    git -C "$APP_DIR" pull
fi

# --- 6. Создать .env если нет ---
echo "[6/7] Checking .env..."
if [ ! -f "$APP_DIR/infra/.env" ]; then
    cp "$APP_DIR/infra/.env.example" "$APP_DIR/infra/.env"
    echo ""
    echo "  ⚠️  .env создан из шаблона — ОБЯЗАТЕЛЬНО заполни значения:"
    echo "     nano $APP_DIR/infra/.env"
    echo ""
fi

# --- 7. SSH ключ для GitHub Actions ---
echo "[7/7] Setting up deploy SSH key..."
DEPLOY_SSH_DIR="/home/$DEPLOY_USER/.ssh"
mkdir -p "$DEPLOY_SSH_DIR"
chmod 700 "$DEPLOY_SSH_DIR"

if [ ! -f "$DEPLOY_SSH_DIR/id_ed25519" ]; then
    ssh-keygen -t ed25519 -C "ghost-ai-deploy@$(hostname)" -f "$DEPLOY_SSH_DIR/id_ed25519" -N ""
    cat "$DEPLOY_SSH_DIR/id_ed25519.pub" >> "$DEPLOY_SSH_DIR/authorized_keys"
    chmod 600 "$DEPLOY_SSH_DIR/authorized_keys"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_SSH_DIR"
    echo ""
    echo "  ✅ SSH ключ создан. Добавь ПРИВАТНЫЙ ключ в GitHub Secrets:"
    echo "     cat $DEPLOY_SSH_DIR/id_ed25519"
    echo ""
else
    echo "  SSH ключ уже существует."
fi

# --- Итог ---
echo ""
echo "======================================"
echo " ✅ Сервер настроен!"
echo ""
echo " Следующие шаги:"
echo "  1. Заполни .env:  nano $APP_DIR/infra/.env"
echo "  2. Добавь в GitHub Secrets:"
echo "     SSH_PRIVATE_KEY = содержимое $DEPLOY_SSH_DIR/id_ed25519"
echo "     SERVER_HOST     = 178.217.101.193"
echo "     SERVER_USER     = $DEPLOY_USER"
echo "     APP_DIR         = $APP_DIR"
echo "  3. Первый деплой:  cd $APP_DIR/infra && docker compose -f docker-compose.prod.yml up -d --build"
echo "======================================"
