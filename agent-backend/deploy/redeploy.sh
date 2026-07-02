#!/usr/bin/env bash
# Быстрый редеплой — запускать на ОБОИХ серверах по очереди после git pull
# На gateway (5.35.127.141):  bash redeploy.sh gateway
# На ai-server (151.247.196.36): bash redeploy.sh ai
set -euo pipefail

ROLE="${1:-}"
REPO_DIR="/opt/autogent/repo"

if [[ "$ROLE" == "gateway" ]]; then
    APP_DIR="/opt/autogent/gateway"
    SRC="$REPO_DIR/agent-backend/gateway"
    SERVICE="autogent-gateway"
    SITE_DIR="/var/www/autogent"

    echo "→ Обновляем gateway..."
    cp "$SRC/main.py" "$SRC/pii_detector.py" "$APP_DIR/"
    systemctl restart "$SERVICE"
    echo "→ Пересобираем фронт..."
    cd "$REPO_DIR"
    npm install --silent && npm run build --silent
    rsync -a --delete dist/ "$SITE_DIR/"
    systemctl reload nginx
    echo "✓ Gateway + фронт обновлены"

elif [[ "$ROLE" == "ai" ]]; then
    APP_DIR="/opt/autogent/ai-service"
    SRC="$REPO_DIR/agent-backend/ai-service"
    SERVICE="autogent-ai"

    echo "→ Обновляем ai-service..."
    cp "$SRC/main.py" "$SRC/funnel.py" "$SRC/security.py" "$SRC/telegram_notifier.py" "$APP_DIR/"
    systemctl restart "$SERVICE"
    echo "✓ AI-сервис обновлён"

else
    echo "Использование: $0 gateway | ai"
    exit 1
fi
