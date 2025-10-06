---
title: Production Setup
description: Configure and optimize for production
---

Deploy Glueful to a production server with proper configuration and optimization.

## Server Requirements

- PHP 8.2+
- Composer
- Database (MySQL 8.0+, PostgreSQL 13+, or SQLite)
- Web server (Nginx recommended)
- Process supervisor (Supervisor, systemd)
- Redis (optional, for caching/queues)

## Installation

### 1. Clone Repository

```bash
cd /var/www
git clone https://github.com/your-org/your-app.git
cd your-app
```

### 2. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader --classmap-authoritative
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

Set production values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com

DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=production_db
DB_USERNAME=prod_user
DB_PASSWORD=secure_password

CACHE_DRIVER=redis
REDIS_HOST=localhost
REDIS_PORT=6379

QUEUE_CONNECTION=redis

TOKEN_SALT=generate-a-strong-random-salt
JWT_KEY=your-secure-jwt-key
```

### 4. Run Migrations

```bash
php glueful migrate:run
```

### 5. Set Permissions

```bash
chown -R www-data:www-data /var/www/your-app
chmod -R 755 /var/www/your-app
chmod -R 775 storage/
```

## Web Server Configuration

### Nginx

`/etc/nginx/sites-available/your-app`:

```nginx
server {
    listen 80;
    server_name api.example.com;
    root /var/www/your-app/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### SSL/TLS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com
```

Updated Nginx config (SSL):

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;
    root /var/www/your-app/public;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}
```

## PHP-FPM Configuration

`/etc/php/8.2/fpm/pool.d/www.conf`:

```ini
[www]
user = www-data
group = www-data

listen = /run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

Restart PHP-FPM:

```bash
systemctl restart php8.2-fpm
```

## Queue Workers

### Supervisor Configuration

`/etc/supervisor/conf.d/glueful-worker.conf`:

```ini
[program:glueful-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/your-app/vendor/bin/glueful queue:work
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/your-app/storage/logs/worker.log
stopwaitsecs=3600
```

Start workers:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start glueful-worker:*
```

## Task Scheduler

Add to crontab:

```bash
crontab -e -u www-data
```

```cron
* * * * * cd /var/www/your-app && php glueful queue:scheduler run >> /dev/null 2>&1
```

## Database Optimization

### MySQL Configuration

`/etc/mysql/my.cnf`:

```ini
[mysqld]
max_connections = 100
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
# MySQL 8 removes query cache; avoid deprecated settings
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT
```

### Create Database

```sql
CREATE DATABASE production_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'prod_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON production_db.* TO 'prod_user'@'localhost';
FLUSH PRIVILEGES;
```

## Redis Configuration

`/etc/redis/redis.conf`:

```conf
bind 127.0.0.1
port 6379
maxmemory 256mb
maxmemory-policy allkeys-lru
```

Restart Redis:

```bash
systemctl restart redis
```

## PHP Configuration

`/etc/php/8.2/fpm/php.ini`:

```ini
memory_limit = 256M
upload_max_filesize = 20M
post_max_size = 20M
max_execution_time = 60

; OPcache
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.revalidate_freq=0
```

## Logging

### Application Logs

```bash
mkdir -p storage/logs
touch storage/logs/app.log
chown www-data:www-data storage/logs/app.log
```

### Log Rotation

`/etc/logrotate.d/glueful`:

```
/var/www/your-app/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## Monitoring

### Health Endpoints (Built-in)

Glueful provides production-ready health routes out of the box; no custom route is required.

- Overall: `GET /health`
- Database: `GET /health/database`
- Cache: `GET /health/cache`
- Liveness: `GET /healthz`
- Readiness: `GET /ready` (IP allowlist enforced)
- Detailed metrics: `GET /health/detailed` (auth + permissions required)

Quick checks:

```bash
curl -fsS http://localhost/healthz
curl -fsS http://localhost/health | jq '.data.status'
curl -fsS http://localhost/ready -I
```

Security configuration:

```env
# Allow only these IPs to access /ready (comma-separated)
HEALTH_IP_ALLOWLIST=127.0.0.1,10.0.0.0/8
# Require auth for health endpoints (optional)
HEALTH_AUTH_REQUIRED=false
```

Notes:
- `/health/detailed` is protected and requires authentication and appropriate permissions.
- Health routes include sensible rate limiting; use them with monitoring systems and load balancers.

### Monitor Queue

```bash
# Check worker status
sudo supervisorctl status glueful-worker:*

# Monitor queue depth
# Note: Uses the configured Redis prefix (default: glueful:queue:)
# Default example key: glueful:queue:queue:default
redis-cli LLEN glueful:queue:queue:default
```

## Backups

### Database Backup Script

`/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
mkdir -p $BACKUP_DIR

mysqldump -u prod_user -p'secure_password' production_db > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Make executable:

```bash
chmod +x /usr/local/bin/backup-db.sh
```

Add to crontab:

```cron
0 2 * * * /usr/local/bin/backup-db.sh
```

## Security

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Disable Unnecessary Services

```bash
sudo systemctl disable apache2
sudo systemctl stop apache2
```

### Secure PHP

```ini
; Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen

; Hide PHP version
expose_php = Off
```

## Performance Optimization

### Enable OPcache

Already configured in `php.ini` above.

### Composer Optimization

```bash
composer dump-autoload --optimize --classmap-authoritative
```

### Database Indexes

Ensure all frequently queried columns are indexed:

```php
$table->index('email');
$table->index('status');
$table->index(['user_id', 'created_at']);
```

## Deployment Script

`deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
composer install --no-dev --optimize-autoloader --classmap-authoritative

echo "Running migrations..."
php vendor/bin/glueful migrate:run

echo "Production audit..."
php vendor/bin/glueful system:production --check || true

echo "(Optional) Compile DI container..."
php vendor/bin/glueful di:container:compile --optimize || true

echo "Restarting services..."
sudo supervisorctl restart glueful-worker:*

echo "Deployment complete!"
```

Make executable:

```bash
chmod +x deploy.sh
```

## Troubleshooting

### Check PHP-FPM Status

```bash
systemctl status php8.2-fpm
tail -f /var/log/php8.2-fpm.log
```

### Check Nginx Status

```bash
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Check Worker Status

```bash
sudo supervisorctl status
tail -f storage/logs/worker.log
```

### Check Database Connection

```bash
php -r "new PDO('mysql:host=localhost;dbname=production_db', 'prod_user', 'secure_password');"
```

## Next Steps

- [Docker Deployment](/deployment/docker) - Deploy with containers
- [Zero Downtime](/deployment/zero-downtime) - Deploy without downtime
- [Monitoring](/advanced/performance) - Monitor performance
