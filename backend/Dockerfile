FROM php:8.4-apache

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git \
    && docker-php-ext-install pdo pdo_pgsql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .

WORKDIR /var/www/html/backend

RUN composer install --no-dev --optimize-autoloader

RUN sed -i 's|/var/www/html|/var/www/html/backend/public|g' \
    /etc/apache2/sites-available/000-default.conf

EXPOSE 80
