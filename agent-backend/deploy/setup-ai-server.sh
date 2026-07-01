#!/usr/bin/env bash
# Запускать один раз на сервере 151.247.196.36 (под root)
# bash setup-ai-server.sh
set -euo pipefail

APP_DIR="/opt/autogent/ai-service"

echo "=== [1/5] Системные пакеты ==="
apt-get update -qq
apt-get install -y -qq python3.12 python3.12-venv python3-pip git ufw

echo "=== [2/5] Firewall ==="
ufw allow OpenSSH
# Порт 8001 открыт ТОЛЬКО для gateway-сервера
ufw allow from 5.35.127.141 to any port 8001 proto tcp
ufw --force enable

echo "=== [3/5] AI-сервис — код и зависимости ==="
REPO_DIR="/opt/autogent/repo"
mkdir -p "$APP_DIR"
cp -r "$REPO_DIR/agent-backend/ai-service/"* "$APP_DIR/"
cd "$APP_DIR"
python3.12 -m venv .venv
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet \
    "fastapi>=0.115" "uvicorn[standard]>=0.30" "openai>=1.50" \
    "python-dotenv>=1.0" "slowapi>=0.1.9" "pydantic>=2.9"

echo "=== [4/5] Systemd сервис ==="
cp "$REPO_DIR/agent-backend/deploy/ai-service.service" /etc/systemd/system/autogent-ai.service
systemd-analyze verify /etc/systemd/system/autogent-ai.service
systemctl daemon-reload
systemctl enable autogent-ai

echo ""
echo "=== ГОТОВО ==="
echo "Осталось:"
echo "  1. cp $APP_DIR/env.example $APP_DIR/.env"
echo "  2. nano $APP_DIR/.env  → заполнить OPENAI_API_KEY и INTERNAL_KEY"
echo "  3. systemctl start autogent-ai"
echo "  4. Проверить: curl http://localhost:8001/health"
