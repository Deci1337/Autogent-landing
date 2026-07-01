#!/bin/bash
# Запускать на 5.35.127.141 от root
# bash setup-main-server.sh

set -e

echo "=== 1. Обновляем пакеты ==="
apt update && apt upgrade -y
apt install -y nginx python3.11 python3-pip python3.11-venv certbot python-certbot-nginx git curl

echo "=== 2. Клонируем репозиторий ==="
git clone https://github.com/Deci1337/Autogent-landing.git /opt/autogent
cd /opt/autogent

echo "=== 3. Устанавливаем Node.js (для сборки фронтенда) ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "=== 4. Собираем React-приложение ==="
cd /opt/autogent
npm ci
# Укажите реальный URL gateway (через nginx /api/)
echo "VITE_AGENT_URL=https://autogentgroup.ru/api" > .env
npm run build

echo "=== 5. Копируем сборку в nginx root ==="
mkdir -p /var/www/autogent
cp -r dist/* /var/www/autogent/

echo "=== 6. Настраиваем nginx ==="
cp /opt/autogent/deploy/nginx-site.conf /etc/nginx/sites-available/autogent
ln -sf /etc/nginx/sites-available/autogent /etc/nginx/sites-enabled/autogent
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo "=== 7. SSL через Let's Encrypt ==="
certbot --nginx -d autogentgroup.ru -d www.autogentgroup.ru --non-interactive --agree-tos -m katranamir@gmail.com
systemctl reload nginx

echo "=== 8. Gateway (FastAPI) ==="
cd /opt/autogent/agent-backend/gateway
python3.11 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install fastapi uvicorn httpx python-dotenv slowapi pydantic

mkdir -p /var/lib/autogent

cp .env.example .env
echo ""
echo ">>> ВАЖНО: отредактируйте /opt/autogent/agent-backend/gateway/.env"
echo "    AI_SERVICE_URL, AI_SERVICE_KEY"
echo ""

echo "=== 9. Systemd сервис для Gateway ==="
cat > /etc/systemd/system/autogent-gateway.service << 'EOF'
[Unit]
Description=Autogent Gateway
After=network.target

[Service]
User=root
WorkingDirectory=/opt/autogent/agent-backend/gateway
EnvironmentFile=/opt/autogent/agent-backend/gateway/.env
ExecStart=/opt/autogent/agent-backend/gateway/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable autogent-gateway
# systemctl start autogent-gateway  # запустите после настройки .env

echo ""
echo "=== ГОТОВО ==="
echo "1. Отредактируйте /opt/autogent/agent-backend/gateway/.env"
echo "2. systemctl start autogent-gateway"
echo "3. systemctl status autogent-gateway"
