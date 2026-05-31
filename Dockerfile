FROM php:8.1-fpm-bullseye

ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-mysql-client git libfreetype6-dev libicu-dev libjpeg62-turbo-dev \
        libpng-dev libsqlite3-dev libzip-dev unzip zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install bcmath exif gd intl pcntl pdo_mysql pdo_sqlite sockets zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-webchat.ini
COPY docker/php/entrypoint.sh /usr/local/bin/webchat-entrypoint
RUN chmod +x /usr/local/bin/webchat-entrypoint

EXPOSE 9000
ENTRYPOINT ["webchat-entrypoint"]
CMD ["php-fpm"]
