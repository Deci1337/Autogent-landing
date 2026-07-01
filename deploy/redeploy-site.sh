#!/bin/bash
# Быстрый редеплой после push на GitHub
# Запускать на 5.35.127.141

set -e
cd /opt/autogent
git pull
npm ci
npm run build
cp -r dist/* /var/www/autogent/
systemctl restart autogent-gateway
echo "Redeploy done"
