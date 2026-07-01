#!/usr/bin/env bash
# Запускать один раз на сервере 5.35.127.141 (под root)
# bash setup-gateway.sh
set -euo pipefail

DOMAIN="autogentgroup.ru"
SITE_DIR="/var/www/autogent"
APP_DIR="/opt/autogent/gateway"
DB_DIR="/var/lib/autogent"

echo "=== [1/7] Системные пакеты ==="
apt-get update -qq
apt-get install -y -qq python3.12 python3.12-venv python3-pip nginx certbot python3-certbot-nginx git curl ufw

echo "=== [2/7] Firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=== [3/7] Директории ==="
mkdir -p "$SITE_DIR" "$APP_DIR" "$DB_DIR"
chown -R www-data:www-data "$DB_DIR"

echo "=== [4/7] Gateway — код и зависимости ==="
# Предполагается: репо уже склонировано в /opt/autogent/repo
REPO_DIR="/opt/autogent/repo"
cp -r "$REPO_DIR/agent-backend/gateway/"* "$APP_DIR/"
cd "$APP_DIR"
python3.12 -m venv .venv
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet \
    "fastapi>=0.115" "uvicorn[standard]>=0.30" "httpx>=0.27" \
    "python-dotenv>=1.0" "slowapi>=0.1.9" "pydantic>=2.9"

echo "=== [5/7] Systemd сервис ==="
cp "$REPO_DIR/agent-backend/deploy/gateway.service" /etc/systemd/system/autogent-gateway.service
systemd-analyze verify /etc/systemd/system/autogent-gateway.service
systemctl daemon-reload
systemctl enable autogent-gateway

echo "=== [6/7] Nginx ==="
cp "$REPO_DIR/agent-backend/deploy/nginx-gateway.conf" /etc/nginx/sites-available/autogent
ln -sf /etc/nginx/sites-available/autogent /etc/nginx/sites-enabled/autogent
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo "=== [7/7] SSL (Let's Encrypt) ==="
# Временно запускаем nginx на HTTP для проверки домена
systemctl start nginx || true
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos \
    --email katranamir@gmail.com --redirect
systemctl reload nginx

echo ""
echo "=== ГОТОВО ==="
echo "Осталось:"
echo "  1. cp $APP_DIR/env.example $APP_DIR/.env"
echo "  2. nano $APP_DIR/.env  → заполнить ключи"
echo "  3. systemctl start autogent-gateway"
echo "  4. Задеплоить сборку фронтенда в $SITE_DIR"
