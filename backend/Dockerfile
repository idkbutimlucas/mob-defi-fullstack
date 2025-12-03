# syntax=docker/dockerfile:1

# ============================================
# Base image with PHP 8.4 and common extensions
# ============================================
FROM php:8.4-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpq-dev \
    icu-dev \
    libzip-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    intl \
    opcache \
    zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# ============================================
# Development stage
# ============================================
FROM base AS development

# Install development dependencies
RUN apk add --no-cache \
    linux-headers \
    $PHPIZE_DEPS

# Install Xdebug for coverage
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

# Copy PHP development configuration
COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini

# Create non-root user
RUN addgroup -g 1000 app && adduser -u 1000 -G app -s /bin/sh -D app
RUN chown -R app:app /app

USER app

# Expose PHP-FPM port
EXPOSE 9000

CMD ["php-fpm"]

# ============================================
# Production dependencies stage
# ============================================
FROM base AS vendor

WORKDIR /app

# Copy composer files
COPY composer.json composer.lock* ./

# Install dependencies without dev
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-progress

# Copy application source
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --classmap-authoritative

# ============================================
# Production stage
# ============================================
FROM base AS production

# Copy PHP production configuration
COPY docker/php.prod.ini /usr/local/etc/php/conf.d/app.ini

# Create non-root user
RUN addgroup -g 1000 app && adduser -u 1000 -G app -s /bin/sh -D app

WORKDIR /app

# Copy application from vendor stage
COPY --from=vendor --chown=app:app /app /app

USER app

# Expose PHP-FPM port
EXPOSE 9000

CMD ["php-fpm"]
