#!/bin/sh
set -e

# APP_KEY, DB_* etc. come from Railway's environment variables (see DEPLOYMENT.md).
if [ ! -f /var/www/html/.env ]; then
    cp /var/www/html/.env.example /var/www/html/.env
fi

php artisan config:clear
php artisan migrate --force
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
