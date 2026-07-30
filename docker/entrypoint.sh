#!/bin/sh
set -e

# Railway assigns a dynamic $PORT and proxies to whatever the container
# listens on - Apache's default config hardcodes port 80, which is why the
# platform showed "Unexposed service" and the healthcheck failed even though
# the build/deploy steps succeeded. Rewrite Apache's listen port at container
# start (not build time, since $PORT isn't known until then).
: "${PORT:=80}"
sed -ri "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/:80>/:${PORT}>/" /etc/apache2/sites-available/*.conf

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
