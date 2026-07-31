# SportBridge production image for Railway.

# Stage 1: compile Vite assets in a real Node image - far more reliable than
# installing Node.js on top of a Debian PHP image via a curl|bash script
# (that approach previously failed the Railway build: curl wasn't even
# installed in the base image, so the install command failed immediately).
FROM node:20-slim AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY vite.config.js ./
COPY resources resources
RUN npm run build

# Stage 2: the actual app. php:8.2-apache matches composer.json's "php": "^8.2".
FROM php:8.2-apache AS app

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql gd zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Isolated into its own layer (previously bundled into the RUN above, which
# turned out to be unreliable for reasons still unclear - runtime logs kept
# showing mpm_event.load/.conf present alongside mpm_prefork.load/.conf
# despite this exact rm+enmod appearing to succeed and its own configtest
# passing at build time). Explicit paths (no globs), unconditional before/
# after output printed straight to the build log, and a hard configtest
# gate so this is fully verifiable from Build Logs on the next attempt.
RUN echo "MPM state BEFORE fix:" \
    && (ls -la /etc/apache2/mods-enabled/ | grep -i mpm || echo "(none found)") \
    && rm -f /etc/apache2/mods-enabled/mpm_event.load \
             /etc/apache2/mods-enabled/mpm_event.conf \
             /etc/apache2/mods-enabled/mpm_worker.load \
             /etc/apache2/mods-enabled/mpm_worker.conf \
             /etc/apache2/mods-enabled/mpm_prefork.load \
             /etc/apache2/mods-enabled/mpm_prefork.conf \
    && a2enmod mpm_prefork \
    && echo "MPM state AFTER fix:" \
    && ls -la /etc/apache2/mods-enabled/ | grep -i mpm \
    && apache2ctl configtest

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache serves the app from public/, as Laravel requires.
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --no-autoloader

COPY . .
COPY --from=assets /app/public/build public/build
RUN composer dump-autoload --optimize --no-dev

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80
ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
