---
title: Options for Deployment
description: Deploy Glueful to production
---

Deploy your Glueful application to production environments with confidence.

## Deployment Options

- **[Production Setup](/deployment/production)** - Server configuration and optimization
- **[Docker](/deployment/docker)** - Containerized deployment
- **[Zero Downtime](/deployment/zero-downtime)** - Deploy without service interruption

## Quick Start

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader --classmap-authoritative

# Run database migrations
php glueful migrate:run

# Start workers and scheduler
php glueful queue:work
php glueful queue:scheduler work
```

Note: Use a production web server (e.g., Nginx + PHP-FPM or Caddy). The `serve` command is for local development only.

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Dependencies optimized
- [ ] Queue workers running
- [ ] Scheduler configured
- [ ] Scheduler running (daemon or cron)
- [ ] Logs configured
- [ ] Backups automated
- [ ] Monitoring enabled
- [ ] SSL/TLS enabled
- [ ] Firewall configured
- [ ] Production audit run: `php vendor/bin/glueful system:production --check`
- [ ] DI container compiled (optional): `php vendor/bin/glueful di:container:compile --optimize`

## Deployment Workflow

1. **Build** - Install dependencies and optimize
2. **Test** - Run test suite
3. **Package** - Create deployment artifact
4. **Audit** - Run `system:production --check` and address issues
5. **Migrate** - Update database schema
6. **Deploy** - Release new version
7. **Monitor** - Watch for issues

## Infrastructure

### Web Server
- Nginx + PHP-FPM (recommended)
- Caddy (simpler alternative)
- Apache + mod_php

### Background Services
- Queue workers
- Task scheduler
- Cron jobs

### Supporting Services
- Database (MySQL, PostgreSQL, SQLite)
- Cache (Redis, Memcached)
- Storage (Local, S3, Azure, GCS)

## Next Steps

Start with [Production Setup](/deployment/production) to learn how to deploy to a production server.
