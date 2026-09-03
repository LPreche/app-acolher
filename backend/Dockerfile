FROM php:8.2-cli-alpine

# Instala dependências do sistema e extensões do PHP necessárias para o Laravel e PostgreSQL
RUN apk add --no-cache \
    bash \
    curl \
    git \
    libpng-dev \
    libzip-dev \
    postgresql-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        gd \
        intl \
        bcmath \
        opcache

# Instala o Composer oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Define o diretório de trabalho da aplicação
WORKDIR /var/www

# Copia os arquivos do projeto backend
COPY . .

# Instala as dependências do Composer para produção
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Ajusta permissões de escrita para logs e cache
RUN chmod -R 777 storage bootstrap/cache

# Habilita múltiplos workers simultâneos para processar requisições concorrentes sem fila
ENV PHP_CLI_SERVER_WORKERS=4

# Executa o servidor Laravel otimizado na porta fornecida pelo Render
CMD php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
