---
title: Introduction
description: Overview, quickstart, project structure, and FAQs
---
# Getting Started with Glueful

Glueful is a modern, enterprise-grade PHP API framework designed for building secure, scalable, and high-performance applications. Built with PHP 8.3+ and leveraging cutting-edge development practices, Glueful provides a comprehensive toolkit for professional API development with minimal configuration overhead.

## What is Glueful?

Glueful is a high-performance PHP framework that prioritizes developer productivity while maintaining enterprise-grade features. It's designed specifically for building modern APIs with:

- **Developer-first experience** - Interactive setup wizard and powerful CLI tools
- **Enterprise architecture** - Production-ready with connection pooling, queues, and advanced caching  
- **Security by default** - CSRF protection, baseline security headers, tiered rate limiting, and hardened API keys
- **Performance optimized** - Built-in memory management and query optimization
- **API-first design** - Automatic OpenAPI/Swagger documentation
- **Extensible** - High-performance extension system

## When to Use Glueful

Glueful is perfect for:

- **API-first applications** - REST APIs, microservices, and backend services
- **Enterprise applications** - Applications requiring robust security, performance, and scalability
- **Modern PHP development** - Projects leveraging PHP 8.3+ features and modern practices
- **Rapid prototyping** - Quick API development with built-in tooling
- **Team collaboration** - Standardized structure and comprehensive documentation

## Quick Start

Get up and running with Glueful in under 5 minutes using the API skeleton:

```bash
composer create-project glueful/api-skeleton my-api
cd my-api
php glueful serve
```

Your API is now running at `http://localhost:8000` (try `/welcome`, `/v1/status`, `/health`). Use `--port`/`--host` to change the bind address, or `--watch` to restart on file changes.

The skeleton enables the [`glueful/users`](/essentials/identity) user store by default, so the framework's auth endpoints are live under the API prefix (e.g. `POST /api/v1/auth/login`).

From here, follow the dedicated guides:

- **[Installation](/getting-started/installation)** — requirements, skeleton vs. framework-only, running the dev server, and adding your first route

## Project Structure

The API skeleton provides a clean, organized structure:

```
my-api/
├── app/                    # Application code (namespace App\)
│   ├── Controllers/        # HTTP controllers (WelcomeController)
│   ├── Models/             # ORM models
│   └── Providers/          # AppServiceProvider — registers your services/controllers
├── bootstrap/
│   └── app.php             # Framework bootstrap
├── config/                 # App config (overrides framework defaults)
│   ├── app.php
│   ├── database.php
│   ├── extensions.php      # Which installed extensions are enabled
│   ├── serviceproviders.php
│   └── ...
├── database/
│   └── migrations/         # Your app's migrations
├── public/
│   └── index.php           # HTTP entry point
├── routes/
│   └── api.php             # Every routes/*.php file is auto-loaded
├── storage/                # Cache, logs, SQLite database
│   ├── cache/
│   ├── logs/
│   └── database/
├── tests/                  # PHPUnit: Feature/, Unit/, Support/
└── glueful                 # CLI entrypoint (php glueful …)
```

Add your own folders (e.g. `app/Services`, `app/Repositories`) as the app grows — anything under `app/` autoloads as `App\`.

## Core Features Overview

### Foundation
- Modern PHP 8.3+ architecture with attributes and typed properties
- Powerful Dependency Injection container with service providers
- High-performance router with a `RouteMiddleware` pipeline (a PSR-15 bridge is available for third-party middleware)
- Request Context architecture eliminating superglobal dependencies

### API Development
- RESTful API endpoints with automatic OpenAPI/Swagger documentation
- Multi-layer request validation with centralized helpers
- Standardized error handling with secure production responses
- Tiered rate limiting (fixed window, sliding window, token bucket) configured per route

### Database & Performance  
- Connection pooling with health monitoring
- Advanced QueryBuilder with JSON support and bulk operations
- Repository pattern with consistent data access
- Memory-efficient processing for large datasets

### Security & Production
- Multi-layered security (CSRF, headers, lockdown modes)
- Authorization seams (`#[RequiresPermission]`, `#[RequiresRole]`, policies) — role-based access control itself comes from the optional `glueful/aegis` extension
- Security events, with audit logging available via the `glueful/audit` extension
- Production-hardened defaults and monitoring

### Developer Experience
- Interactive CLI with setup wizards and generators
- Development server with file watching (`php glueful serve --watch`)
- Comprehensive error pages and debugging tools
- Built-in profiling and performance monitoring

## Next Steps

Now that you have Glueful running:

1. **[Installation Guide](/getting-started/installation)** - Install, run, and build your first route
2. **[Configuration](/advanced/configuration)** - Environment setup and config options  
3. **[Core Concepts](/essentials)** - Learn the essentials you’ll use daily

### FAQ

:::accordion
    ::::accordion-item
    ---
    label: Is Glueful production-ready?
    ---
    Yes! Glueful is designed for enterprise use with features like connection pooling, advanced caching, security hardening, and comprehensive monitoring.
    ::::

    ::::accordion-item
    ---
    label: How does Glueful compare to other modern frameworks?
    ---
    Glueful is API-focused with lighter overhead, built-in performance optimizations, and enterprise features like connection pooling out of the box. It's designed specifically for modern API development rather than being a general-purpose web framework.
    ::::

    ::::accordion-item
    ---
    label: Can I use existing PHP libraries?
    ---
    Absolutely! Glueful is built on standard PSR interfaces and works with existing Composer packages.
    ::::

    ::::accordion-item
    ---
    label: What about database support?
    ---
    Glueful supports PostgreSQL, MySQL, and SQLite (the skeleton defaults to SQLite). `php glueful install` can configure any of the three, with connection pooling and query optimization built in.
    ::::

    ::::accordion-item
    ---
    label: Is there a community?
    ---
    Yes! Join our growing community through GitHub discussions, contribute to the project, or check out our roadmap for upcoming features.
    ::::
