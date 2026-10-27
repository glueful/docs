---
title: Techniques and Patterns
description: Advanced techniques and patterns for production applications
---

Take your Glueful application to the next level with advanced patterns, testing strategies, and production best practices.

## Topics

- **[Dependency Injection](/advanced/dependency-injection)** - the container, providers, the `services()` DSL, factories, tags
- **[Service Providers](/advanced/service-providers)** - the provider model and built-in providers
- **[Repositories](/advanced/repositories)** - the repository pattern, UnitOfWork, DTOs
- **[Middleware](/advanced/middleware)** - the pipeline, alias catalog, and PSR-15
- **[Configuration](/advanced/configuration)** - environment-aware configuration
- **[Performance](/advanced/performance)** - optimization and monitoring
- **[Testing](/advanced/testing)** - the base `TestCase`, HTTP and database tests, test-state gotchas
- **[OpenAPI](/advanced/openapi)** - generating the API spec from your routes

## What You'll Learn

### Testing Strategies
- Writing unit and integration tests
- Testing HTTP endpoints and jobs
- Mocking dependencies
- Test organization

### Configuration Management
- Environment-based configuration
- How framework, app and per-environment files merge
- Secrets and sensitive data
- Environment tooling (`doctor`, `env:sync`)

### Middleware Patterns
- Creating custom middleware
- Middleware ordering
- Route, group and app-wide middleware
- The built-in alias catalog

### Performance Optimization
- Query optimization and profiling
- Caching strategies
- Memory management
- Connection pooling

## Production Readiness

These guides help you:
- Build testable, maintainable code
- Optimize for performance
- Secure sensitive configuration
- Scale your application

## Next Steps

Start with [Testing](/advanced/testing) to learn how to write reliable tests for your application.

Upgrading an existing app? Read [Upgrading](/upgrading) first: several 1.91 fixes change behaviour on upgrade (route params now applied, rate limits auto-attached, `API_RATE_LIMITING_ENABLED` / `api.field_selection.enabled` honoured, `LOG_LEVEL` filtering, route cache format v3, OpenAPI tags, removed tracing keys).
