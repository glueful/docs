---
title: Schema API
description: Define and migrate database schemas
---

# Schema API

Reference for schema definition and migration helpers.

This section covers the schema abstraction: defining tables & columns, evolving structures safely with migrations, validating intended changes, previewing diffs, and reverting when necessary. Emphasis is on deterministic, auditable, forward-first evolution with guard rails for production (zero / minimal downtime) while keeping local developer experience fast.

## Design Principles
| Principle | Rationale |
|-----------|-----------|
| Forward-Only Bias | Most destructive reversions are riskier than new forward fixes |
| Deterministic Output | Same migration inputs => identical SQL across environments |
| Safety Nets | Preflight validation, dry-run previews, existence checks |
| Engine Feature Detection | Use advanced capabilities only when supported (e.g., transactional DDL) |
| Minimal Locking | Prefer operations that avoid long-lived table locks |

## Migration Lifecycle
1. Author migration (create/alter) with clear intent & timestamp prefix.
2. Dry run / preview: generate change preview, review SQL.
3. Validate: ensure tables/columns exist (or don't) as expected.
4. Apply inside transaction (if engine supports for operations) else guarded sequence.
5. Record applied migration row (checksum, timestamp, environment).
6. (Optional) Revert using generated revert operations if safe.

## Operation Categories
| Category | Examples | Risk Level |
|----------|----------|-----------|
| Additive | add column (nullable), add index, add table | Low |
| Backfill | populate new column in chunks | Medium (runtime dependent) |
| Transform | change type with conversion, rename column | Medium/High |
| Destructive | drop column/table, drop index | High |

## Zero / Low Downtime Strategies
- Add nullable column first, deploy code writing both old/new, backfill, then enforce NOT NULL.
- Use `rename` + synonyms (or dual-write) where atomic rename not fast.
- Create new index concurrently (Postgres) or outside traffic peaks.
- Avoid adding large NOT NULL columns with default (may rewrite entire table in some engines); instead add nullable then update & add constraint.

## Naming Conventions
| Artifact | Pattern | Example |
|----------|---------|---------|
| Migration File | `YYYYMMDDHHMMSS_description.php` | `20250927094500_add_audit_logs_table.php` |
| Foreign Key | `fk_<table>_<column>` | `fk_orders_customer_id` |
| Index | `idx_<table>_<columns>` | `idx_users_email_status` |
| Unique Index | `uniq_<table>_<columns>` | `uniq_users_email` |

## Validation & Preview
Use `generateChangePreview()` before execution to inspect planned operations. `validate()` can ensure naming/length conventions and reserved words avoidance. Treat preview output as mandatory review step in CI for migrations PRs.

## Revert Philosophy
Reverts (`executeRevert()` / `generateRevertOperations()`) are best-effort. Not all transforms are reversible (data-loss). For irreversible steps, embed a comment header explaining manual recovery strategy (restore from backup, compute derived data again, etc.).

## Schema Introspection
Methods like `getTableSchema()`, `getTableColumns()`, `hasColumn()`, and `exportTableSchema()` support dynamic tooling (e.g., comparing desired spec file vs live DB). Avoid dynamic alteration in request path—restrict to maintenance or deployment phases.

## Foreign Keys & Constraints
- Ensure indexed referencing columns before adding FK (performance & validation speed).
- Name constraints explicitly for future targeted drops.
- Consider deferring constraints in bulk load phases (engine permitting) then enforce.

## Index Strategy
| Pattern | Guidance |
|---------|----------|
| Composite | Order columns by selectivity & common query predicates |
| Covering | Include columns used only in projection to avoid lookups |
| Write Heavy Tables | Minimize secondary indexes (each write cost) |
| Partial (where supported) | Narrow index to active subset for size savings |

## Table Builder Example (Illustrative)
```php
schema()->createTable('audit_logs', function (TableBuilder $t) {
	$t->uuid('id')->primary();
	$t->string('actor_id', 36)->index();
	$t->string('action', 64)->index();
	$t->json('meta')->nullable();
	$t->timestamp('created_at');
	$t->index(['actor_id','created_at']);
});
```

## Alter Example
```php
schema()->alterTable('users')
	->addColumn('last_login_at', ['type' => 'timestamp', 'nullable' => true])
	->addColumn('login_count', ['type' => 'integer', 'default' => 0])
	->execute();
```

## Data Migrations vs Schema Migrations
Keep data backfills separate or clearly annotated. Long-running data updates should stream in id batches rather than locking full table. Provide progress logging & ability to resume.

## Safety Checklist Before Apply
1. Preview output reviewed.
2. Operations categorized & high-risk steps isolated.
3. Backups verified (recent & restorable) for destructive changes.
4. Feature flags / dual-write path deployed (if required).
5. Rollback feasibility assessed (document if not). 
6. Monitoring (query errors, replication lag) ready during deploy.

## Observability
Metrics:
| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `migration_apply_duration_ms` | histogram | migration | Apply time |
| `migration_errors_total` | counter | migration | Failures |
| `schema_validation_fail_total` | counter | rule | Validation issues |

Logs should include: migration name, batch, checksum, status, duration, applied operations count.

## Extension Points
| Extension | Purpose | Notes |
|-----------|---------|-------|
| Custom Type Definition | Map domain type to engine column(s) | E.g., JSON encryption wrapper |
| Naming Strategy | Override default index/FK naming | Ensure global uniqueness |
| Preview Formatter | Render diff as Markdown / JSON for PR bots | Aid code review |
| Policy Validator | Enforce org-specific rules (no unindexed FK, etc.) | Fails validation step |

## Anti-Patterns
| Anti-Pattern | Risk | Alternative |
|--------------|------|-----------|
| Huge single destructive migration | Long downtime window | Phase into smaller steps |
| Adding NOT NULL with default to big table | Full table rewrite | Add nullable, backfill, add constraint |
| Swapping columns with drop/create | Data loss | Add new, copy, rename if atomic, then drop old |
| Unnamed constraints/indexes | Hard to drop or manage | Always name explicitly |

## Rollout Workflow (Recommended)
1. Commit migration & open PR; CI runs validation/preview.
2. Review preview for safety & naming.
3. Merge & deploy application code (migration present but not applied yet) if dual-write required.
4. Run migration tool (manual or release script) watching metrics.
5. Post-deploy verify queries & latency; follow up with clean-up migration if temporary columns remain.

---

<!-- database-schema-api:reference:start -->
## Schema Methods

| Method | Parameters | Returns | Source |
|--------|------------|---------|--------|
| `addColumn()` | string $table, string $column, array $definition | array | SchemaBuilderInterface |
| `addForeignKey()` | array $foreignKeys | self | SchemaBuilderInterface |
| `addIndex()` | array $indexes | self | SchemaBuilderInterface |
| `addPendingOperation()` | string $sql | void | SchemaBuilderInterface |
| `alterTable()` | string $name | TableBuilderInterface | SchemaBuilderInterface |
| `createDatabase()` | string $name | self | SchemaBuilderInterface |
| `createTable()` | string $name, callable $callback=? | TableBuilderInterface\|self | SchemaBuilderInterface |
| `disableForeignKeyChecks()` | — | self | SchemaBuilderInterface |
| `dropColumn()` | string $table, string $column | array | SchemaBuilderInterface |
| `dropDatabase()` | string $name | self | SchemaBuilderInterface |
| `dropForeignKey()` | string $table, string $constraint | bool | SchemaBuilderInterface |
| `dropIndex()` | string $table, string $index | bool | SchemaBuilderInterface |
| `dropTable()` | string $name | self | SchemaBuilderInterface |
| `dropTableIfExists()` | string $name | self | SchemaBuilderInterface |
| `enableForeignKeyChecks()` | — | self | SchemaBuilderInterface |
| `execute()` | — | array | SchemaBuilderInterface |
| `executeRevert()` | array $operations | array | SchemaBuilderInterface |
| `exportTableSchema()` | string $table, string $format | array | SchemaBuilderInterface |
| `generateChangePreview()` | string $table, array $changes | array | SchemaBuilderInterface |
| `generateRevertOperations()` | array $change | array | SchemaBuilderInterface |
| `getConnection()` | — | Connection | SchemaBuilderInterface |
| `getTableColumns()` | string $table | array | SchemaBuilderInterface |
| `getTableRowCount()` | string $table | int | SchemaBuilderInterface |
| `getTableSchema()` | string $table | array | SchemaBuilderInterface |
| `getTableSize()` | string $table | int | SchemaBuilderInterface |
| `getTables()` | — | array | SchemaBuilderInterface |
| `hasColumn()` | string $table, string $column | bool | SchemaBuilderInterface |
| `hasTable()` | string $table | bool | SchemaBuilderInterface |
| `importTableSchema()` | string $table, array $schema, string $format, array $options | array | SchemaBuilderInterface |
| `preview()` | — | array | SchemaBuilderInterface |
| `reset()` | — | self | SchemaBuilderInterface |
| `table()` | string $name | TableBuilderInterface | SchemaBuilderInterface |
| `transaction()` | callable $callback | self | SchemaBuilderInterface |
| `validate()` | — | array | SchemaBuilderInterface |
| `validateSchema()` | array $schema, string $format | array | SchemaBuilderInterface |

<!-- database-schema-api:reference:end -->
