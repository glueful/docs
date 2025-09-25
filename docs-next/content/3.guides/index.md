---
title: Guides
description: Task‑oriented guides organized by domain: HTTP, Data, Core Services, and Tooling
navigation:
  icon: i-lucide-compass
---

# Guides

Practical, task‑oriented documentation for building production applications with Glueful. Guides answer: “How do I accomplish X with the framework?” and sit between hands‑on [Tutorials](/tutorials) and the exhaustive [Reference](/reference).

Use Guides when you already know what you want to achieve and need patterns, code examples, and best practices. Each page ends with links to related Concepts, Reference APIs, and Recipes for quick follow‑up exploration.

## Structure

The Guides are grouped into four main areas:

### 1. HTTP
Fundamentals of handling requests and shaping API behavior.

- [Routing](/guides/http/routing) – Define routes, groups, naming, and versioning
- [Middleware](/guides/http/middleware) – Cross‑cutting concerns, ordering, composition
- [Requests & Responses](/guides/http/requests-and-responses) – Input handling, JSON, streaming
- [Validation & DTOs](/guides/http/validation-and-dtos) – Declarative validation, data shaping
- [API Docs (OpenAPI)](/guides/http/api-docs-openapi) – Generating and publishing specs
- [CORS & CSRF](/guides/http/cors-and-csrf) – Browser security constraints & protections
- [Rate Limiting](/guides/http/rate-limiting) – Throttling patterns, idempotency helpers

### 2. Data
Designing, migrating, and accessing application data.

- [Query Builder & Transactions](/guides/data/query-builder-and-transactions) – Composable queries, atomic work
- [Migrations & Schema](/guides/data/migrations-and-schema) – Reproducible structure evolution
- [Models & Repositories](/guides/data/models-and-repositories) – Encapsulation & persistence boundaries
- [Pagination & Seeding](/guides/data/pagination-and-seeding) – Efficient listing & initial data bootstrap

### 3. Core Services
Infrastructure capabilities for resilience, scale, and user experience.

- [Caching](/guides/core-services/caching) – Layers, invalidation patterns, cache stampede avoidance
- [Queues & Jobs](/guides/core-services/queues-and-jobs) – Async work, retries, backoff strategies
- [Events & Listeners](/guides/core-services/events-and-listeners) – Decoupling, sync vs async delivery
- [Notifications](/guides/core-services/notifications) – Channels, templates, retries
- [Uploads & Storage](/guides/core-services/uploads-and-storage) – Local & remote adapters, presigned flows
- [Scheduling](/guides/core-services/scheduling) – Cron style tasks, distributed coordination
- [Distributed Locks](/guides/core-services/distributed-locks) – Safely mutating shared resources

### 4. Tooling
Developer and operational workflows that support the lifecycle.

- [CLI & Console](/guides/tooling/cli-and-console) – Command creation, environment bootstrap
- [Testing](/guides/tooling/testing) – Unit, feature, HTTP, and integration strategies
- [Configuration](/guides/tooling/configuration) – Environment layering, caching, secrets
- [Deployment](/guides/tooling/deployment) – Build artifacts, environment promotion, runtime tuning

## Guide Format

Every guide follows a consistent template:

- Overview & When to Use
- Setup / Prerequisites
- Core Patterns & Example Code
- Performance Considerations
- Security & Failure Modes
- Configuration Keys & Defaults
- Troubleshooting / Gotchas
- Related: Concepts • Reference • Recipes

## Choosing Between Docs Types

| If you want | Go to |
|-------------|-------|
| A fast, end‑to‑end build experience | Tutorials |
| Conceptual understanding & mental models | Concepts |
| API surface & signatures | Reference |
| Step‑by‑step solution for a specific task | Guides |
| Copy‑paste snippets for narrow tasks | Recipes |

## Next Steps

Start with the area most relevant to your current work:

- Building endpoints? Jump into [Routing](/guides/http/routing).
- Modeling data flows? See [Models & Repositories](/guides/data/models-and-repositories).
- Adding async work? Explore [Queues & Jobs](/guides/core-services/queues-and-jobs).
- Preparing for launch? Review [Deployment](/guides/tooling/deployment).

Looking for something else? Use search or browse the [Reference](/reference) for full API details.

> Need a pattern that’s missing? Open a discussion or issue—Guides evolve based on real-world use.
