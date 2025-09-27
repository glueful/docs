---
title: Query API
description: Compose and execute queries, with transactions
---

# Query API

Reference for the query builder and execution patterns.

The fluent query builder provides a composable, engine‑portable way to assemble parameterized SQL statements while keeping intent readable: select columns, filter, aggregate, paginate, mutate, and wrap operations inside transactions. This narrative focuses on method categories, chaining rules, parameter binding, performance considerations, and safe usage patterns.

## Design Goals
| Goal | Description |
|------|-------------|
| Safety | All user input becomes bound parameters (no concatenated literals) |
| Composability | Each clause method returns the builder for chaining |
| Transparency | `toSql()` shows the exact driver SQL with placeholders |
| Portability | Grammar adapts differences (limit syntax, JSON ops) |
| Extensibility | Raw expressions allowed but isolated & explicit |

## Core Method Categories
| Category | Representative Methods | Purpose |
|----------|------------------------|---------|
| Projection | `select()`, `distinct()`, `selectRaw()` | Choose result columns |
| Filtering | `where()`, `whereIn()`, `whereNull()`, `whereJsonContains()` | Restrict rows |
| Group / Aggregate | `groupBy()`, `having()`, `count()`, `max()` | Aggregate metrics |
| Joining | `join()`, `leftJoin()`, `rightJoin()` | Combine tables |
| Ordering & Window | `orderBy()`, `orderByRandom()` | Sort result set |
| Pagination | `limit()`, `offset()`, `paginate()` | Page through large sets |
| Mutations | `insert()`, `insertBatch()`, `update()`, `delete()`, `upsert()` | Write operations |
| Soft Delete Helpers | `withTrashed()`, `onlyTrashed()`, `restore()` | Manage soft‑deleted records |
| Diagnostics | `toSql()`, `explain()`, `enableDebug()` | Visibility / debugging |
| Execution & Utilities | `get()`, `first()`, `exists()`, `pluck()`, `paginate()` | Run & fetch results |
| Raw Escape Hatches | `raw()`, `whereRaw()`, `havingRaw()`, `orderByRaw()` | Complex clauses |
| Caching & Meta | `cache()`, `withPurpose()` | Cache semantics & labeling |
| Transactional | `transaction()` | Scoped atomic work |

## Chaining & Immutability
The builder mutates internal state in place but you can `clone()` to branch:
```php
$base = db()->table('users')->where('status','active');
$recent = (clone $base)->where('created_at','>', now()->subMonth());
$older  = (clone $base)->where('created_at','<=', now()->subMonth());
```

## Parameter Binding
All placeholder values are bound with native driver parameter types when possible. Raw expressions NEVER auto-bind—pass bindings explicitly (e.g. `whereRaw('score > ?', [$threshold])`).

## Conditional Constraints Pattern
You can build conditional queries via PHP control flow or a small helper pattern:
```php
$q = db()->table('orders');
if ($customerId) { $q->where('customer_id', $customerId); }
if ($from && $to) { $q->whereBetween('created_at', $from, $to); }
```
Keep builder usage outside of complex nested ternaries for clarity.

## Raw Expressions
Use `raw()` sparingly for vendor-specific functions (JSON, window functions). Wrap user input as parameters; never interpolate directly inside the raw string.

## Soft Deletes
`withTrashed()` includes soft-deleted rows. `onlyTrashed()` restricts solely to them. `restore()` flips the deleted marker. These methods presume a conventional `deleted_at` column—verify schema alignment.

## Pagination & Counting
`paginate($page,$perPage)` performs a count query (may optimize by stripping clauses). For heavy joins, consider caching counts or providing a simplified count builder to avoid expensive COUNT(*). Expose `withPurpose('listing')` to annotate intent for diagnostics.

## Caching Query Results
`cache($ttl)` attaches a TTL for the SELECT result. Under the hood a normalized key (SQL + ordered bindings) seeds the cache. Avoid caching queries with volatile session-specific joins or ephemeral tables.

## Transactions Inline
Convenience method `transaction(fn(){ ... })` wraps builder operations:
```php
db()->transaction(function () {
	db()->table('invoices')->insert([...]);
	db()->table('ledger')->insert([...]);
});
```
Prefer a higher-level service orchestrating complex multi-entity workflow; the inline transaction keeps boundaries local for atomic sets.

## Upsert Semantics
`upsert($data, $updateColumns)` performs an insert or update on conflict (keys determined by schema uniqueness). Provide only columns you intend to update; leaving fields out prevents accidental overwrites. For bulk upserts consider chunking to avoid large single statements on engines with parameter limits.

## Explain & Performance Diagnostics
Use `explain()` during development; never depend on its output format for logic. Combine with logging of `toSql()` for slow query triage.

## Error Handling
Most builder methods throw on connection or syntax errors; mutation methods return affected row counts. Always check return value when performing destructive operations (e.g., expecting exactly 1 row updated for optimistic concurrency).

## Anti-Patterns
| Anti-Pattern | Risk | Better Approach |
|--------------|------|----------------|
| Chaining 30+ `orWhere()` for large sets | Long SQL & plan instability | Use `whereIn()` / temp table |
| `orderByRandom()` on large tables | Full scan + sort | Pre-compute random sample table |
| Fetching huge unpaged result sets | Memory blow up | Paginate / stream |
| Dynamic column names from user input | Injection risk | Map via whitelist array |

## Observability Hooks
`withPurpose('analytics_rollup')` can tag queries so logging & metrics aggregate by logical purpose rather than only raw SQL. Combine with tracing attributes `db.query.purpose` for flame graph clarity.

## Example End-to-End
```php
$page = (int)($request->query->get('page') ?? 1);
$per  = 25;
$users = db()->table('users')
	->select(['id','email','created_at'])
	->where('status','active')
	->whereLike('email', '%@example.com')
	->orderBy('created_at','desc')
	->paginate($page, $per);
```

---

<!-- database-query-api:reference:start -->
## Fluent Methods

| Method | Parameters | Returns | Source |
|--------|------------|---------|--------|
| `cache()` | int $ttl=? | static | QueryBuilder |
| `clone()` | — | self | QueryBuilder |
| `count()` | — | int | QueryBuilder |
| `delete()` | — | int | QueryBuilder |
| `distinct()` | bool $distinct=? | static | QueryBuilder |
| `enableDebug()` | bool $debug=? | static | QueryBuilder |
| `executeModification()` | string $sql, array $bindings=? | int | QueryBuilder |
| `executeRaw()` | string $sql, array $bindings=? | array | QueryBuilder |
| `executeRawFirst()` | string $sql, array $bindings=? | array | QueryBuilder |
| `exists()` | — | bool | QueryBuilder |
| `explain()` | — | array | QueryBuilder |
| `first()` | — | array | QueryBuilder |
| `from()` | string $table | static | QueryBuilder |
| `get()` | — | array | QueryBuilder |
| `getBindings()` | — | array | QueryBuilder |
| `groupBy()` | $columns | static | QueryBuilder |
| `having()` | array $conditions | static | QueryBuilder |
| `havingRaw()` | string $condition, array $bindings=? | static | QueryBuilder |
| `insert()` | array $data | int | QueryBuilder |
| `insertBatch()` | array $rows | int | QueryBuilder |
| `join()` | string $table, string $first, string $operator, string $second, string $type=? | static | QueryBuilder |
| `leftJoin()` | string $table, string $first, string $operator, string $second | static | QueryBuilder |
| `limit()` | int $count | static | QueryBuilder |
| `max()` | string $column | mixed | QueryBuilder |
| `offset()` | int $count | static | QueryBuilder |
| `onlyTrashed()` | — | static | QueryBuilder |
| `optimize()` | — | static | QueryBuilder |
| `orWhere()` | $column, $operator=?, $value=? | static | QueryBuilder |
| `orWhereNotNull()` | string $column | static | QueryBuilder |
| `orWhereNull()` | string $column | static | QueryBuilder |
| `orderBy()` | $column, string $direction=? | static | QueryBuilder |
| `orderByRandom()` | — | static | QueryBuilder |
| `orderByRaw()` | string $expression | static | QueryBuilder |
| `paginate()` | int $page=?, int $perPage=? | array | QueryBuilder |
| `pluck()` | string $column, string $key=? | array | QueryBuilder |
| `raw()` | string $expression | RawExpression | QueryBuilder |
| `restore()` | — | int | QueryBuilder |
| `rightJoin()` | string $table, string $first, string $operator, string $second | static | QueryBuilder |
| `select()` | array $columns=? | static | QueryBuilder |
| `selectRaw()` | string $expression | static | QueryBuilder |
| `toSql()` | — | string | QueryBuilder |
| `transaction()` | callable $callback | mixed | QueryBuilder |
| `update()` | array $data | int | QueryBuilder |
| `upsert()` | array $data, array $updateColumns | int | QueryBuilder |
| `where()` | $column, $operator=?, $value=? | static | QueryBuilder |
| `whereBetween()` | string $column, mixed $min, mixed $max | static | QueryBuilder |
| `whereIn()` | string $column, array $values | static | QueryBuilder |
| `whereJsonContains()` | string $column, string $searchValue, string $path=? | static | QueryBuilder |
| `whereLike()` | string $column, string $pattern | static | QueryBuilder |
| `whereNotIn()` | string $column, array $values | static | QueryBuilder |
| `whereNotNull()` | string $column | static | QueryBuilder |
| `whereNull()` | string $column | static | QueryBuilder |
| `whereRaw()` | string $condition, array $bindings=? | static | QueryBuilder |
| `withPurpose()` | string $purpose | static | QueryBuilder |
| `withTrashed()` | — | static | QueryBuilder |

## Notes

- Methods aggregated from interface plus concrete implementation.
- Signatures may be simplified; consult source for full phpdoc including exceptions.

<!-- database-query-api:reference:end -->
