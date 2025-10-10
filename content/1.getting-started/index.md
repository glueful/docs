---
title: Introduction
description: Overview, quickstart, project structure, and FAQs
---
# Getting Started with Glueful

Glueful is a modern, enterprise-grade PHP API framework designed for building secure, scalable, and high-performance applications. Built with PHP 8.2+ and leveraging cutting-edge development practices, Glueful provides a comprehensive toolkit for professional API development with minimal configuration overhead.

## What is Glueful?

Glueful is a high-performance PHP framework that prioritizes developer productivity while maintaining enterprise-grade features. It's designed specifically for building modern APIs with:

- **Developer-first experience** - Interactive setup wizard and powerful CLI tools
- **Enterprise architecture** - Production-ready with connection pooling, queues, and advanced caching  
- **Security by default** - Multi-layered security with CSRF, rate limiting, and secure sessions
- **Performance optimized** - Built-in memory management and query optimization
- **API-first design** - Automatic OpenAPI/Swagger documentation
- **Extensible** - High-performance extension system

## When to Use Glueful

Glueful is perfect for:

- **API-first applications** - REST APIs, microservices, and backend services
- **Enterprise applications** - Applications requiring robust security, performance, and scalability
- **Modern PHP development** - Projects leveraging PHP 8.2+ features and modern practices
- **Rapid prototyping** - Quick API development with built-in tooling
- **Team collaboration** - Standardized structure and comprehensive documentation

## Quick Start

Get up and running with Glueful in under 5 minutes using the API skeleton:

### Prerequisites

- PHP 8.2 or higher
- Composer 2+
- SQLite (default) or your preferred database

### Installation

```bash
# Create a new Glueful project from the API skeleton (recommended)
composer create-project glueful/api-skeleton my-api
cd my-api
# Start the development server
```

### Your First Request

Visit your new API:

- **Welcome endpoint**: `http://127.0.0.1:8080/`
- **Health check**: `http://127.0.0.1:8080/health`

### Hello World Route

Add a simple route in `routes/api.php`:

```php
<?php

use Glueful\Http\Response;

// Add to your existing routes
$router->get('/hello', function() {
    return new Response([
        'message' => 'Hello, Glueful!',
        'timestamp' => date('c')
    ]);
});
```

## Project Structure

The API skeleton provides a clean, organized structure:

```
my-api/
├── app/                    # Application code
│   ├── Controllers/        # HTTP controllers
│   ├── Models/            # Data models
│   └── Services/          # Business logic
├── bootstrap/
│   └── app.php            # Framework bootstrap
├── config/                # Configuration files
│   ├── app.php            # Application config
│   ├── database.php       # Database settings
│   └── ...                # Feature-specific configs
├── database/
│   └── migrations/        # Database migrations
├── public/
│   └── index.php          # HTTP entry point
├── routes/
│   └── api.php            # Route definitions
├── storage/               # Cache, logs, database
│   ├── cache/
│   ├── logs/
│   └── database/
└── tests/                 # Test files
```

## Core Features Overview

### Foundation
- Modern PHP 8.2+ architecture with attributes and typed properties
- Powerful Dependency Injection container with service providers
- Advanced routing system with PSR-15 middleware support
- Request Context architecture eliminating superglobal dependencies

### API Development
- RESTful API endpoints with automatic OpenAPI/Swagger documentation
- Multi-layer request validation with centralized helpers
- Standardized error handling with secure production responses
- Adaptive rate limiting with behavior analysis

### Database & Performance  
- Connection pooling with health monitoring
- Advanced QueryBuilder with JSON support and bulk operations
- Repository pattern with consistent data access
- Memory-efficient processing for large datasets

### Security & Production
- Multi-layered security (CSRF, headers, lockdown modes)
- Permission system with role-based access control
- Audit logging and security event tracking
- Production-hardened defaults and monitoring

### Developer Experience
- Interactive CLI with setup wizards and generators
- Hot-reload development server
- Comprehensive error pages and debugging tools
- Built-in profiling and performance monitoring

## Next Steps

Now that you have Glueful running:

1. **[Installation Guide](/getting-started/installation)** - Detailed installation and setup
2. **[Configuration](/advanced/configuration)** - Environment setup and config options  
3. **[Quick Tutorial](/getting-started/quickstart)** - Build your first complete API
4. **[Core Concepts](/essentials)** - Learn the essentials you’ll use daily

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
    Glueful supports PostgreSQL, MySQL, SQLite, and other PDO-compatible databases with advanced features like connection pooling and query optimization.
    ::::

    ::::accordion-item
    ---
    label: Is there a community?
    ---
    Yes! Join our growing community through GitHub discussions, contribute to the project, or check out our roadmap for upcoming features.
    ::::
