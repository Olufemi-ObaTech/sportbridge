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

# Belt-and-suspenders: the Dockerfile's own build-time fix verifiably
# leaves the image with only mpm_prefork enabled (confirmed via its build
# log output), yet mpm_event.load/.conf were still observed present at
# actual container start on Railway - something between build completion
# and this script running reintroduces it, cause still unconfirmed.
# Re-applying the same cleanup here, immediately before Apache starts,
# guarantees correctness regardless of what's happening in between.
echo "--- mods-enabled mpm state on container start (before cleanup) ---"
ls -la /etc/apache2/mods-enabled/ | grep -i mpm || echo "(no mpm files found)"
rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf \
      /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf
a2enmod mpm_prefork >/dev/null
echo "--- mods-enabled mpm state on container start (after cleanup) ---"
ls -la /etc/apache2/mods-enabled/ | grep -i mpm
apache2ctl configtest

# APP_KEY, DB_* etc. come from Railway's environment variables (see DEPLOYMENT.md).
if [ ! -f /var/www/html/.env ]; then
    cp /var/www/html/.env.example /var/www/html/.env
fi

php artisan config:clear

# Deliberately non-fatal: Laravel's /up health route (see railway.json's
# healthcheckPath) never touches the database, so a broken DB_* connection
# should not prevent Apache from starting and answering the healthcheck -
# it should surface as a normal error on DB-backed pages instead, visible
# in `php artisan logs`/Railway's runtime logs, not as an opaque container
# crash-loop with no way to see why. Set DB_* correctly in Railway's
# Variables tab (see DEPLOYMENT.md) and redeploy to clear this warning.
if ! php artisan migrate --force; then
    echo "WARNING: migrations failed - check DB_* environment variables. Continuing to start Apache so the app (and its real error) is still reachable." >&2
fi

php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
