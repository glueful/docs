---
title: Data
description: Query builder, migrations, schema, models, repositories, pagination, seeding
navigation:
  icon: i-lucide-database
---

# Data Guides

Design and access data effectively with Glueful: connection management, pooling, migrations, schema evolution, query efficiency, caching, repositories, pagination, and seeding. This index orients you across forthcoming deep‑dive pages.

> Note: The current framework snapshot exposes configuration (`config/database.php`) but core abstractions for query builder, migrations, and repositories do not yet appear under `src/`. Sections referencing those components are marked as Assumptions so they can be validated once code lands.

## Overview

Glueful’s data layer aims to provide:

| Goal | Description |
|------|-------------|
| Fast Startup | Lightweight configuration + connection laziness until first query |
| Environment Awareness | Sensible defaults (SQLite dev, MySQL/Postgres prod) via `DB_DRIVER` |
| Secure Connectivity | SSL/TLS flags + cert verification backing MySQL/Postgres |
| Efficient Resource Use | Connection pooling & per‑engine overrides |
| Predictable Schema Changes | Timestamped migrations & repeatable operations (Assumption) |
| Consistent Access Patterns | Repository / model boundaries (Assumption) |
| Observability | Slow query logging + query cache metrics |
| Caching | Declarative query cache with exclusions & invalidation hooks |

## Configuration Snapshot (`config/database.php`)

```php
'engine' => env('DB_DRIVER', 'sqlite');
```

Supported engines: `sqlite`, `mysql`, `pgsql` (switch using `DB_DRIVER`).

### MySQL

Key settings (abbrev.): host, port, db, user, pass, charset, collation, prefix, strict, engine, role + nested `ssl` block controlling `enabled`, CA & client certificates, and verification.

### PostgreSQL

Adds `schema`, `sslmode`, `timezone`, separate role variable. Defaults `sslmode` to `require` in production (via env heuristic).

### SQLite

Uses relative or absolute file resolution; includes separate testing file path and role flag.

### Pooling

`pooling.enabled` + `defaults` (min/max connections, idle/max lifetime, acquisition & health check intervals, retry strategy) with per‑engine overrides (e.g. higher MySQL cap, single writer for SQLite). Legacy `pool` block remains for backward compatibility.

### Logging

`logging.enabled` defaults to on in non‑production; `slow_threshold` (ms) for highlighting heavy queries; `query.log` path provided.

### Migrations (Assumption)

Config defines: `migrations.table`, `migrations.path`. Tooling (CLI commands like `migrate`, `migrate:rollback`) expected to operate here once implemented.

### Query Cache

`query_cache.enabled`, default TTL, underlying `store` (e.g. redis), auto invalidation toggle, plus exclusion lists for tables and regex patterns that should bypass caching (write or locking statements).

> Tip: Keep `exclude_tables` current—add high‑churn operational tables to prevent stale reads.

## Environment Variables (Core)

```dotenv
# Engine selection
DB_DRIVER=sqlite

# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=glueful
DB_USERNAME=root
DB_PASSWORD=secret
DB_SSL_ENABLED=true
DB_SSL_VERIFY_CERT=true

# PostgreSQL
DB_PGSQL_HOST=127.0.0.1
DB_PGSQL_PORT=5432
DB_PGSQL_DATABASE=glueful
DB_PGSQL_USERNAME=postgres
DB_PGSQL_PASSWORD=secret
DB_PGSQL_SCHEMA=public
DB_PGSQL_SSL_MODE=require

# Pooling
DB_POOL_MIN_CONNECTIONS=2
DB_POOL_MAX_CONNECTIONS=10
DB_POOL_MAX_LIFETIME=3600

# Query Cache
QUERY_CACHE_ENABLED=true
QUERY_CACHE_TTL=3600
QUERY_CACHE_STORE=redis
QUERY_CACHE_AUTO_INVALIDATE=true
```

> Warning: Never commit real certificate paths or secrets; rely on environment injection / secrets management.

## Planned Guide Structure

| Guide | Focus | Status |
|-------|-------|--------|
| Query Builder & Transactions | Fluent API, parameter binding, nested transactions | Available |
| Migrations & Schema | Creating, running, rolling back, idempotent ops | Available |
| Models & Repositories | Domain modeling, data mappers, testing seams | Available |
| Pagination & Seeding | Cursor vs offset, seed strategies, large dataset seeding | Available |
| Performance & Caching | N+1 avoidance, cache layering, pool tuning | Inferred |

## Access Patterns (Assumption)

Expected layering:

```mermaid
flowchart LR
  Controller --> Service --> Repository --> (Query Builder) --> Connection --> Database
```

> Tip: Keep business logic outside repositories—limit them to persistence concerns for clear test boundaries.

## Observability

Slow query logging pairs with metrics (future): emit count and p95 per operation class. Integrate correlation IDs to trace heavy requests across HTTP → DB.

## Performance Guidelines

| Area | Practice | Rationale |
|------|----------|-----------|
| Pool Size | Set max near 2–4× CPU cores | Prevent oversubscription & context thrash |
| Idle Timeout | Trim idle at 5m | Release unused connections | 
| Prepared Statements (Assumption) | Reuse for hot queries | Lower parse/plan overhead |
| Cache Invalidation | Auto + manual bust endpoints | Avoid stale critical reads |
| Pagination | Prefer keyset (cursor) for deep pages | Stable performance vs OFFSET |

> Tip: Consider feature flags around query cache to disable rapidly during incident mitigation.

## Troubleshooting (Early)

| Symptom | Hint |
|---------|------|
| Connection storm on deploy | Tune pool warmup & max connections |
| High p95 latency spike | Check slow log, inspect missing indexes |
| Cache returning stale rows | Verify `auto_invalidate` & exclusion patterns |
| SQLite path not found | Ensure relative path resolved inside project root |
| SSL handshake failures | Confirm CA / client cert env variables set & readable |

## Next Steps

* Proceed to (upcoming) Query Builder guide
* Plan migration naming conventions (`YYYYMMDDHHMMSS_description.php`)
* Evaluate pool sizing in staging traffic replay
* Draft repository interfaces aligned with service layer needs

---

**Summary:** The data layer configuration is in place—next iterations will add the executable primitives (query builder, migrations, repositories). Prepare by standardizing env variables, naming, and performance baselines now.
