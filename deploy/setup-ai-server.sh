#!/bin/bash
# Запускать на 151.247.196.36 от root
# bash setup-ai-server.sh

set -e

echo "=== 1. Обновляем пакеты ==="
apt update && apt upgrade -y
apt install -y python3.11 python3-pip python3.11-venv git ufw

echo "=== 2. Файрвол — только порт 8001 для главного сервера ==="
ufw default deny incoming
ufw allow ssh
ufw allow from 5.35.127.141 to any port 8001
ufw --force enable

echo "=== 3. Клонируем репозиторий ==="
git clone https://github.com/Deci1337/Autogent-landing.git /opt/autogent
cd /opt/autogent/agent-backend/ai-service

echo "=== 4. Python окружение ==="
python3.11 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install fastapi uvicorn openai python-dotenv slowapi pydantic

echo "=== 5. Настройте .env ==="
cp .env.example .env
echo ""
echo ">>> ВАЖНО: отредактируйте /opt/autogent/agent-backend/ai-service/.env"
echo "    OPENAI_API_KEY и INTERNAL_KEY"
echo ""

echo "=== 6. Systemd сервис ==="
cat > /etc/systemd/system/autogent-ai.service << 'EOF'
[Unit]
Description=Autogent AI Service
After=network.target

[Service]
User=root
WorkingDirectory=/opt/autogent/agent-backend/ai-service
EnvironmentFile=/opt/autogent/agent-backend/ai-service/.env
ExecStart=/opt/autogent/agent-backend/ai-service/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable autogent-ai
# systemctl start autogent-ai  # запустите после настройки .env

echo ""
echo "=== ГОТОВО ==="
echo "1. Отредактируйте /opt/autogent/agent-backend/ai-service/.env"
echo "2. systemctl start autogent-ai"
echo "3. curl http://localhost:8001/health"
