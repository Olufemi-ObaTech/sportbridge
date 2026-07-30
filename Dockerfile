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
    # This base image ships both mpm_event and mpm_prefork enabled, which
    # Apache refuses to start with ("More than one MPM loaded") - mod_php
    # requires the (non-threaded) prefork MPM specifically, so disable event.
    && a2dismod mpm_event \
    && a2enmod mpm_prefork \
    && rm -rf /var/lib/apt/lists/*

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
