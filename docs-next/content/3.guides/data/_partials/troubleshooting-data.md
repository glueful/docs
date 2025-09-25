<!-- Reusable troubleshooting partial for Data guides (Query Builder, Transactions, Migrations, Schema) -->

### Troubleshooting

| Concern | Symptom | Likely Cause | Resolution |
|---------|---------|--------------|------------|
| Query Builder | Unsafe raw SQL | Using selectRaw() / whereRaw() with user input | Parameterize values; avoid concatenation |
| Query Builder | N+1 detected | Loop executing per-row queries | Preload related data or batch with IN clause |
| Query Builder | Slow large OFFSET | Deep pagination with OFFSET/LIMIT | Switch to keyset (cursor) pagination |
| Query Builder | Wrong results with joins | Ambiguous column names | Qualify columns or add aliases |
| Transactions | Deadlock retries exhausted | High contention on same rows | Reduce transaction scope; add indexes; reorder writes |
| Transactions | Nested transaction failed silently | Relying on partial rollback without savepoints | Ensure SavepointManager active; test nested rollback path |
| Transactions | Long-running transaction | Holding locks across external I/O | Move I/O (HTTP calls, file ops) outside transaction |
| Migrations | Migration not discovered | File naming off or path not registered | Use timestamp prefix; verify path in `config/database.php` & manager paths |
| Migrations | Rollback skipped | No batch or dependency mismatch | Check batch number; ensure reversible operations implemented |
| Migrations | Checksum mismatch | Edited applied migration | Create new corrective migration; never edit applied file |
| Schema | Missing index performance issue | Filtering/sorting unindexed column | Add appropriate composite / covering index |
| Schema | Foreign key creation fails | Order of table creation wrong | Ensure referenced tables created earlier in sequence |
| Pooling | Connection leak suspicion | Growing active count never falls | Ensure releases after manual acquire; wrap in try/finally |
| Query Cache | Stale data served | Auto invalidation disabled | Enable `QUERY_CACHE_AUTO_INVALIDATE` or manual bust |
| Repository | Duplicate instance creation | New instance each call | Use `RepositoryFactory` caching methods |
| Repository | Slow bulk insert | Per-row `create` in loop | Switch to `bulkCreate` with chunking |
| Repository | Soft-deleted data visible | Missing status predicate | Centralize active scope helper / global filter |
| Unit of Work | Partial commit applied | Exception mid commit | Verify transaction boundaries; add idempotent retries |
| Pagination | Duplicate / missing rows | Unstable sort column (updated_at) | Use monotonic key + tie-breaker |
| Pagination | Growing response time page N | Offset strategy deep scan | Switch to keyset cursors |
| Seeding | Re-running inserts fails | Unique constraint collisions | Add existence checks / idempotent logic |
| Seeding | Long lock during import | Huge single transaction | Chunk + commit per batch |
| Seeding | Drift between envs | Non-idempotent seed logic | Track seed version / use checksums |

> Tip: Log `query_id` / correlation IDs with slow query events for traceability across services.
