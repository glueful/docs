---
title: Docker Deployment
description: Deploy Glueful with Docker
---

Deploy your Glueful application using Docker containers for consistent, reproducible deployments.

## Quick Start

### Dockerfile

`Dockerfile`:

```dockerfile
FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application
COPY . /var/www

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --classmap-authoritative

# Set permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 9000

CMD ["php-fpm"]
```

PostgreSQL users: add the PostgreSQL extension

```dockerfile
# If you use PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*
```

### Docker Compose

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: glueful-app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
      - ./storage:/var/www/storage
    networks:
      - glueful

  nginx:
    image: nginx:alpine
    container_name: glueful-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www
      - ./docker/nginx:/etc/nginx/conf.d
    networks:
      - glueful

  db:
    image: mysql:8.0
    container_name: glueful-db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
    volumes:
      - dbdata:/var/lib/mysql
    networks:
      - glueful

  redis:
    image: redis:alpine
    container_name: glueful-redis
    restart: unless-stopped
    networks:
      - glueful

  worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: glueful-worker
    restart: unless-stopped
    command: php glueful queue:work
    volumes:
      - ./:/var/www
    networks:
      - glueful
    depends_on:
      - app
      - redis

networks:
  glueful:
    driver: bridge

volumes:
  dbdata:
    driver: local
```

### Nginx Configuration

`docker/nginx/default.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

## Building and Running

### Build Images

```bash
docker-compose build
```

### Start Services

```bash
docker-compose up -d
```

### Run Migrations

```bash
docker-compose exec app php glueful migrate:run
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f worker
```

## Production Dockerfile

`Dockerfile.prod`:

```dockerfile
FROM php:8.3-fpm AS base

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd opcache \
    && pecl install redis \
    && docker-php-ext-enable redis

# Configure PHP
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --classmap-authoritative

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www \
    && chmod -R 775 /var/www/storage

EXPOSE 9000

CMD ["php-fpm"]
```

PostgreSQL users: add the PostgreSQL extension

```dockerfile
# If you use PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*
```

## Docker Compose for Production

`docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: glueful-app
    restart: always
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    env_file:
      - .env.production
    networks:
      - glueful

  nginx:
    image: nginx:alpine
    container_name: glueful-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./public:/var/www/public:ro
      - ./docker/nginx/prod.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - glueful

  db:
    image: mysql:8.0
    container_name: glueful-db
    restart: always
    environment:
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
    volumes:
      - dbdata:/var/lib/mysql
    networks:
      - glueful

  redis:
    image: redis:alpine
    container_name: glueful-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data
    networks:
      - glueful

  worker:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: glueful-worker
    restart: always
    command: php glueful queue:work
    environment:
      - APP_ENV=production
    env_file:
      - .env.production
    networks:
      - glueful
    deploy:
      replicas: 4

  scheduler:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: glueful-scheduler
    restart: always
    command: php glueful queue:scheduler work
    environment:
      - APP_ENV=production
    env_file:
      - .env.production
    networks:
      - glueful

networks:
  glueful:
    driver: bridge

volumes:
  dbdata:
  redisdata:
```

## Multi-Stage Build

Optimized Dockerfile with multi-stage build:

```dockerfile
# Build stage
FROM php:8.3-cli AS builder

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /build

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

# Production stage
FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build /var/www

WORKDIR /var/www

RUN chown -R www-data:www-data /var/www

EXPOSE 9000

CMD ["php-fpm"]
```

PostgreSQL users: add the PostgreSQL extension in the production stage

```dockerfile
# In the production stage (after php:8.3-fpm)
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*
```

## Kubernetes Deployment

`k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: glueful-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: glueful
  template:
    metadata:
      labels:
        app: glueful
    spec:
      containers:
      - name: app
        image: your-registry/glueful:latest
        ports:
        - containerPort: 9000 # php-fpm
        env:
        - name: APP_ENV
          value: "production"
        - name: DB_HOST
          value: "mysql-service"
        - name: REDIS_HOST
          value: "redis-service"
        envFrom:
        - secretRef:
            name: glueful-secrets
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-conf
          mountPath: /etc/nginx/conf.d/default.conf
          subPath: default.conf
        - name: public
          mountPath: /var/www/public
      volumes:
      - name: nginx-conf
        configMap:
          name: glueful-nginx
      - name: public
        emptyDir: {}
apiVersion: v1
kind: Service
metadata:
  name: glueful-service
spec:
  selector:
    app: glueful
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

### Nginx ConfigMap (minimal)

`k8s/nginx-configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: glueful-nginx
data:
  default.conf: |
    server {
      listen 80;
      server_name _;

      # Minimal API-only config: route all to PHP-FPM in the same pod
      location / {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/public/index.php;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_pass 127.0.0.1:9000;
      }

      location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/public$fastcgi_script_name;
        fastcgi_pass 127.0.0.1:9000;
      }
    }
```

Notes:
- For static assets, mount your `public/` directory into the Nginx container or serve assets via a CDN/object storage. The minimal config above is API-focused.

## Health Checks

Use Glueful's built-in endpoints (no custom route required):

- Liveness: `GET /healthz`
- Overall: `GET /health`
- Readiness: `GET /ready` (IP allowlist)

Docker Compose health check:

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Environment Variables

`.env.production`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com

DB_DRIVER=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=production
DB_USERNAME=glueful
DB_PASSWORD=${DB_PASSWORD}

CACHE_DRIVER=redis
REDIS_HOST=redis
REDIS_PORT=6379

QUEUE_CONNECTION=redis

# Security keys
TOKEN_SALT=${TOKEN_SALT}
JWT_KEY=${JWT_KEY}
```

## Best Practices

### Use .dockerignore

`.dockerignore`:

```
.git
.env
.env.*
!.env.example
node_modules
vendor
storage/logs/*
storage/cache/*
tests
.phpunit.cache
```

### Multi-Container Deployment

Separate concerns:
- App container (PHP-FPM)
- Web server (Nginx)
- Database (MySQL/PostgreSQL)
- Cache (Redis)
- Worker (queue processing)

### Volume Management

```yaml
volumes:
  # Named volumes for persistence
  - dbdata:/var/lib/mysql
  - redisdata:/data

  # Bind mounts for development
  - ./:/var/www

  # Read-only mounts for production
  - ./public:/var/www/public:ro
```

## Deployment Commands

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec app php glueful migrate:run

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=8

# (Optional) run dedicated scheduler service
docker-compose -f docker-compose.prod.yml up -d scheduler

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Restart service
docker-compose -f docker-compose.prod.yml restart app
```

## Troubleshooting

**Container won't start?**
- Check logs: `docker-compose logs app`
- Verify environment variables
- Check file permissions

**Database connection failed?**
- Ensure database container is running
- Check `DB_HOST` matches service name
- Verify credentials

**Permission denied?**
- Run: `docker-compose exec app chown -R www-data:www-data /var/www`

## Next Steps

- [Production Setup](/deployment/production) - Server deployment
- [Zero Downtime](/deployment/zero-downtime) - Rolling updates
- [Monitoring](/advanced/performance) - Container monitoring
