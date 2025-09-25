# Glueful Documentation IA (Proposed)

## Top‑Level Navigation

- Start
- Tutorials
- Guides
- Concepts
- Reference
- Operations
- Security
- Extensions
- Recipes
- Contribute

## Start

- Overview: what Glueful is, key capabilities, when to use it
- Quickstart: install, hello‑route, dev server, first request/response
- Project Structure: config, routes, services, environment files
- FAQ: common questions, pitfalls, links to deeper topics
- Release & Versioning: supported PHP, release cadence, LTS, policies

## Tutorials

- Build a JSON API in 15 Minutes
- JWT Auth in 10 Minutes
- CRUD with Validation + Repository
- File Uploads to S3
- Background Jobs + Notifications
- Observability in an Hour (logs, metrics, traces)
- Production Hardening Checklist

## Guides

- HTTP
  - Routing, Groups, Middleware, Rate Limiting
  - Requests & Responses, Error responses
  - Validation & DTOs
  - API Docs (OpenAPI) generation
  - CORS & CSRF
- Data
  - Query Builder & Transactions
  - Migrations & Schema
  - Models & Repositories
  - Pagination & Seeding
- Core Services
  - Caching (drivers, tagging, replication, edge)
  - Queues & Jobs (drivers, retries, failure)
  - Events & Listeners (patterns, async)
  - Notifications (channels, templates)
  - Uploads & Storage (local, S3, CDN)
  - Scheduling (cron, runners)
  - Distributed Locks (patterns, pitfalls)
- Tooling
  - CLI & Console Commands
  - Testing (unit, feature, HTTP, console)
  - Configuration (envs, layering, caching)
  - Deployment (envs, assets, config cache)

## Concepts

- Request Lifecycle: boot → handle → terminate
- Service Container & Autowiring
- Service Providers & Application Bootstrapping
- Controller Patterns & BaseController capabilities
- Permission Model (RBAC) and Resolution
- Caching Strategies (local, shared, edge)
- Observability Model (logs, metrics, traces)
- Error Handling & Exceptions (HTTP/Domain)
- Idempotency, Rate Limiting, Backpressure
- Performance Principles (warmup, pools, zero‑copy patterns)

## Reference

- HTTP: Router, Middleware API, Request/Response API
- Container: binding, resolution, scopes
- Validation: rules, custom validators
- Database: query API, schema API
- Cache: drivers, configuration, API
- Queue: drivers, jobs, monitoring API
- Events: emitter, listeners, contracts
- Notifications: services, templates, channels API
- Storage: adapters, uploader API
- Security: auth, permissions, middleware API
- Observability: logging, metrics, tracing API
- Scheduler, Locks: APIs and options
- CLI: command index and flags
- Configuration Schema: all keys with types and defaults

## Operations

- Deployment Targets (PHP‑FPM, RoadRunner, Swoole, containers)
- Runtime Config: env, secrets, config cache
- Monitoring: health checks, readiness/liveness, dashboards
- Metrics: key series, scraping, alerts
- Tracing: propagation, spans, sampling
- Logging: structure, sinks, correlation
- Performance: tuning, connection pools, caching tiers
- Scaling: workers, queues, backpressure, multi‑region

## Security

- Authentication (JWT, tokens, refresh workflows)
- Authorization (RBAC, roles, permissions, context)
- Best Practices: key rotation, token storage, input hardening
- Production Security: headers, CSP, TLS, DoS, rate limits
- Vulnerability Management & Disclosure
- Compliance Notes (audit trails, PII handling)

## Extensions

- Available Extensions (catalog)
- Creating Extensions (lifecycle, hooks, config)
- Extension Configuration (schema, examples)
- Publishing & Versioning Extensions
- Extension Security & Quality Guidelines

## Recipes

- Task‑oriented “How‑tos” mirroring the framework cookbook
- Each recipe: prerequisites → steps → copy‑paste snippets → verification → gotchas
- Categories: Routing, Middleware, DI, Error Handling, Testing, Deployment, Logging, Caching, Queues, Validation, Database, Security, Events, Console, Extensions, Images, Locks, Notifications, Configuration, Sessions/Analytics, API Metrics, Performance, File Uploads

## Contribute

- Contributing Guide, Code Standards, PR Workflow
- Issue Templates, Reporting Security Issues
- Roadmap and Discussions
- Docs Style & Content Guidelines

## Design Principles

- Three tracks across the site:
  - Tutorials (learn by building)
  - Guides (task‑oriented, opinionated)
  - Reference (exhaustive, skimmable, linkable)
- Every guide ends with: “Related concepts”, “API reference”, and “Recipes”
- Consistent page template: Overview → When to use → Setup → Examples → Performance → Security → API → Configuration → Troubleshooting
- Audience filters (Developer, Ops/SRE, Security) surface relevant pages
- Versioned docs with a switcher; stable is default
- Search facets by area (HTTP, Data, Security, Ops) and by action (“validate”, “queue”, “trace”)
