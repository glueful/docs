---
title: Database (API)
description: Query builder and schema APIs
navigation:
  icon: i-lucide-table
---

# Database API Reference

Reference for querying, transactions, and schema utilities.

This section describes the database abstraction layer: fluent query builder, transaction helpers, schema (migration) facilities, connection pooling, caching, and observability hooks. The goal is to provide composable read/write operations that are portable across engines while remaining transparent enough to reason about generated SQL, performance, and failure modes.

## Architecture & Layers
| Layer | Purpose | Notes |
|-------|---------|-------|
| Connection Resolver | Supplies engine-specific PDO/driver handle (pooled) | Adds retry & health checks |
| Query Builder | Fluent API producing parameterized SQL | Avoids string concatenation & injection risk |
| Grammar / Dialect | Renders engine-specific fragments (limit, json ops) | Pluggable custom grammar |
| Transaction Manager | Nesting-aware transaction boundary control | Uses savepoints where supported |
| Schema Builder | Introspects & mutates schema via migrations | Engine capability detection |
| Migration Runner | Orders & applies versioned migration classes | Idempotent up/down with checksum tracking |
| Query Cache Layer | Caches deterministic SELECT results | Keyed by normalized SQL + bindings |

## Querying Principles
- Always parameterize values; builder handles binding automatically.
- Favor explicit column lists over `*` for stability and performance.
- Compose conditions with small pure segments (predicates) rather than building monolithic raw expressions.
- Use prepared statements for repeated patterns (builder internally caches compiled SQL where safe).

Example (illustrative):
```php
$users = db()->table('users')
    ->select(['id','email'])
    ->where('status', '=', 'active')
    ->whereIn('role', ['admin','editor'])
    ->orderBy('created_at','desc')
    ->limit(50)
    ->get();
```

## Transactions
Transactions accept a closure for automatic commit/rollback, providing safety and nesting support.

Guidelines:
| Concern | Recommendation |
|---------|---------------|
| Scope | Keep minimal—only the statements needing atomicity |
| External I/O | Do NOT perform network calls inside (can stall locks) |
| Idempotency | On retry (deadlock) closure may re-run; ensure safe |
| Error Handling | Throwing exception rolls back; swallow only if sure |

Pseudo:
```php
db()->transaction(function () use ($input) {
    $id = db()->table('orders')->insertGetId($input);
    db()->table('order_events')->insert(['order_id' => $id, 'type' => 'created']);
});
```

Deadlock Mitigation: Automatic limited retry (e.g. 2–3 attempts) with jitter is recommended for serialization / deadlock errors; builder/manager may implement this (verify implementation before relying).

## Schema & Migrations
Migrations define deterministic forward (up) and inverse (down) changes. Keep them:
- **Atomic** when engine supports transactional DDL (e.g., PostgreSQL for many operations).
- **Irreversible** changes (like large destructive drops) should log warnings and supply safe guard rails.
- **Idempotent** checks: guard creation with existence checks when applicable to allow safe re-apply in recovery.

Naming Convention: `YYYYMMDDHHMMSS_create_users_table.php` for chronological ordering (existing numeric prefixes already satisfy ordering; maintain consistency).

Large Table Changes: Prefer phased approach (add nullable column -> backfill in batches -> enforce not null) to avoid long locks.

## Connection Pooling
Pooling reduces connection churn and enforces upper bounds on concurrency.
Key tunables: `min_connections`, `max_connections`, `acquisition_timeout`. Monitor saturation; if threads frequently wait to acquire a connection, either raise max (if DB allows) or optimize query duration.

Pool Hygiene:
- Close idle connections after `idle_timeout`.
- Cap lifetime to mitigate memory / server-side bloat.
- Health check interval should be > typical network blip durations to avoid churn.

## Query Caching
The query cache stores read-only deterministic results. Disabled automatically for statements matching mutation patterns (INSERT/UPDATE/DELETE, FOR UPDATE). Invalidate on table writes if `auto_invalidate` active.

Best Practices:
- Cache only stable SELECTs; avoid highly user-personalized queries unless key space manageable.
- Use TTL aligned with data volatility; shorter than average update interval.
- Exclude hot mutation tables (already configured). Add more exclusions if mismatch.

## Observability
Metrics:
| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `db_query_duration_ms` | histogram | engine, table?, verb | Latency per query |
| `db_query_errors_total` | counter | engine, error_code | Failures |
| `db_pool_acquire_ms` | histogram | engine | Time to get connection |
| `db_pool_acquire_timeout_total` | counter | engine | Pool starvation |
| `db_cache_hit_total` | counter | engine | Query cache hits |
| `db_cache_miss_total` | counter | engine | Query cache misses |

Slow Query Logging: threshold-based logging records normalized SQL + bindings hash, duration, and correlation IDs.

Tracing: span per query with attributes: `db.system`, `db.statement` (redacted or truncated), `db.duration_ms`, `db.pool.wait_ms`.

## Performance Guidelines
| Issue | Pattern | Mitigation |
|-------|---------|-----------|
| N+1 Queries | Repeated single-row lookups in loop | Use IN, joins, or prefetch batching |
| Missing Index | High latency scans | Add composite or covering index |
| Over-selecting | `SELECT *` large payload | Explicit columns & pagination |
| Large Transactions | Long lock retention | Break into smaller units |
| Chatty Writes | Many single inserts | Bulk insert / copy where supported |

## Safety & Security
- Always parameterize to avoid injection.
- Enforce least privilege DB user (separate read vs write credentials if feasible).
- Validate dynamic identifiers (table/column) against allowlists before interpolating into schema operations.
- Redact secrets from logged connection strings.

## Extension Points
| Extension | Contract (Indicative) | Use Case |
|-----------|-----------------------|----------|
| Custom Grammar | Render custom SQL fragments | Vendor-specific features |
| Type Caster | Cast to domain value objects | JSON -> hydrated DTOs |
| Query Observer | Hook pre/post execution | Metrics, rewrite, deny list |
| Connection Strategy | Override pool or failover logic | Multi-region clustering |

## Checklist Before Shipping a Query Heavy Feature
1. Pagination / limits enforced.
2. Index coverage verified (EXPLAIN plan clean).
3. No N+1 patterns (static analysis / review).
4. Transaction scope minimal.
5. Cache opportunities evaluated (read heavy).
6. Observability labels (engine/table) present.

---

## Overview
Philosophy of database abstraction & portability.

## Core Types
| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|

## API Surface
### Creation
Connections, migrations.
### Usage
Query builder chaining, transactions.
### Extension Points
Custom grammar, type casting, connection resolvers.

## Configuration
| Key | Type | Default | Description |
|-----|------|---------|-------------|

## Examples
Select with joins, transaction closure, schema alteration.

## Error Conditions
Connection exceptions, transaction rollback errors.

## Observability & Metrics
Query timing, slow query log integration.

## Performance Notes
Index coverage, N+1 detection heuristics.

## Related
Concepts: Performance Principles, Caching Strategies.

<!-- database:reference:start -->
## Engines & Default

| Default | Available Engines | Query Methods | Schema Methods |
|---------|-------------------|---------------|----------------|
| sqlite | sqlite, mysql, pgsql | 55 | 35 |

## Connection Pooling

- Enabled: yes
- Default limits: min 2, max 10
- Idle timeout: 300s

## Configuration (Redacted)

```json
{
    "engine": "sqlite",
    "mysql": {
        "driver": "mysql",
        "host": "127.0.0.1",
        "port": 3306,
        "db": "glueful",
        "user": "root",
        "pass": "",
        "charset": "utf8mb4",
        "collation": "utf8mb4_unicode_ci",
        "prefix": "",
        "strict": true,
        "engine": "InnoDB",
        "role": "primary",
        "ssl": {
            "enabled": false,
            "ca_cert": null,
            "client_cert": null,
            "client_key": null,
            "verify_cert": true
        },
        "options": {
            "timeout": 30,
            "charset": "utf8mb4"
        }
    },
    "pgsql": {
        "driver": "pgsql",
        "host": "127.0.0.1",
        "port": 5432,
        "db": "glueful",
        "user": "postgres",
        "pass": "",
        "schema": "public",
        "charset": "utf8",
        "prefix": "",
        "sslmode": "prefer",
        "timezone": "UTC",
        "role": ""
    },
    "sqlite": {
        "driver": "sqlite",
        "primary": "<project>/storage/database/glueful.sqlite",
        "testing": "<project>/storage/database/testing.sqlite",
        "role": "backup"
    },
    "pooling": {
        "enabled": true,
        "defaults": {
            "min_connections": 2,
            "max_connections": 10,
            "idle_timeout": 300,
            "max_lifetime": 3600,
            "acquisition_timeout": 30,
            "health_check_interval": 60,
            "health_check_timeout": 5,
            "max_use_count": 1000,
            "retry_attempts": 3,
            "retry_delay": 100
        },
        "engines": {
            "mysql": {
                "max_connections": 20,
                "min_connections": 5
            },
            "pgsql": {
                "max_connections": 15,
                "min_connections": 3
            },
            "sqlite": {
                "max_connections": 1,
                "min_connections": 1
            }
        }
    },
    "pool": {
        "max_connections": 20,
        "min_connections": 5,
        "acquire_timeout": 30,
        "idle_timeout": 300
    },
    "logging": {
        "enabled": true,
        "slow_threshold": 100,
        "log_path": "<project>/storage/logs/query.log"
    },
    "migrations": {
        "table": "migrations",
        "path": "<project>/database/migrations"
    },
    "query_cache": {
        "enabled": true,
        "default_ttl": 3600,
        "store": "redis",
        "auto_invalidate": true,
        "exclude_tables": [
            "migrations",
            "jobs",
            "failed_jobs",
            "sessions"
        ],
        "exclude_patterns": [
            "/^UPDATE/i",
            "/^INSERT/i",
            "/^DELETE/i",
            "/FOR UPDATE$/"
        ]
    }
}
```

## Method Inventories

- See Query API page for detailed fluent builder methods.
- See Schema API page for schema/migration methods.

<!-- database:reference:end -->
