---
title: CLI (API)
description: Built-in commands and authoring new commands
navigation:
  icon: i-lucide-terminal
---

# CLI API Reference

Reference for available commands and building custom ones.

The Glueful CLI is the operational surface of the framework. It exists for three primary goals:

1. Operational efficiency: Perform framework and application maintenance tasks (migrations, cache, queue, security) faster and more safely than ad‑hoc scripts.
2. Developer productivity: Scaffold common artifacts, introspect internals (container, extensions, database), and provide diagnostics during development.
3. Production ergonomics: Offer idempotent, composable commands that behave predictably in CI/CD pipelines and scheduled automation contexts.

This reference covers two angles:
- Using built‑in commands effectively (capabilities, safety flags, dry runs, diagnostics)
- Authoring custom commands (signature design, argument & option parsing, dependency injection, error handling, structured output, testability)

## Command Architecture
Each command is a small, composable unit that expresses a single operational intent. Under the hood:

| Layer | Responsibility | Notes |
|-------|----------------|-------|
| Signature Metadata | Declares name, description, arguments, options | Parsed once at registration; leveraged for help + completion |
| Input Normalization | Converts raw argv into typed values | Supports implicit casting (ints, bools, JSON via flags) |
| Dependency Resolution | Injects services via constructor or handle() parameters | Fully container aware; prefer constructor for required deps |
| Execution Body | Implements the side‑effect safely & atomically when possible | Keep pure logic in services for reuse/testing |
| Output Formatting | Renders human or machine friendly output | Multi-format JSON/table/plain patterns; stable fields for automation |
| Exit Signaling | Returns success/failure codes | Non‑zero for actionable failure; map domain errors to specific codes |

Separation keeps command classes thin; complex domain logic should live in dedicated services invoked by the command.

## Naming & Grouping
Commands use namespace-like prefixes (e.g., `cache:clear`, `queue:work`) forming natural groupings. Guidelines:

- Start with the subsystem (cache, db, queue, security) unless cross‑cutting (e.g., `system:check`).
- Use imperative verbs for actions (`clear`, `run`, `profile`, `generate`, `validate`).
- Prefer nouns only when the command prints informational state (`version`, `migrate:status`).
- Avoid overloading: if a command begins to multiplex unrelated behaviors behind an `action` argument, consider separate focused commands (exception: intentionally orchestrating sub‑actions like `queue:work`).

## Arguments vs Options
Rule of thumb:
- Arguments = required positional context (e.g., a key, username, migration name).
- Options = modifiers, filters, execution mode, output format, dry‑run toggles.

Provide `--dry-run` whenever the operation could mutate state meaningfully (resets, destructive purges, bulk writes). Provide `--force` for bypassing interactive confirmations; never allow destructive operations without at least one safeguard (confirmation, force flag, or dry run output preview).

## Idempotency & Safety
Operational commands (migrations, cache resets, scaling actions) should be idempotent or provide detection logic to make repeated invocations safe in automation. Strategies:
- Locking (acquire distributed lock for migrations or schedule cycles)
- State snapshots or precondition checks before mutating
- Explicit preview modes (`--dry-run` / `--pretend`)
- Hash or version stamping (avoid regenerating identical artifacts)

## Output Strategy
Consistency enables both human readability and machine parsing:

| Mode | When To Use | Characteristics |
|------|-------------|-----------------|
| table | Interactive terminal sessions | Aligned columns, truncated wide fields |
| json | CI scripts, automation, programmatic chaining | Stable keys, no ANSI color |
| plain | Logging or simple piping | Minimal adornment |

Always normalize timestamps (UTC ISO8601), numeric metrics (integers or fixed precision), and booleans (true/false) in JSON output. Avoid embedding explanatory prose in JSON.

## Dependency Injection & Composition
Commands are first-class DI citizens. Prefer constructor injection for mandatory services and method injection for optional collaborators. If initializing a heavy service (e.g., profiling analyzer) only when needed, lazy-resolve it inside the handler after validating input to reduce cost for quick help invocations.

## Error Handling & Exit Codes
Map domain concerns to predictable exit codes:
- 0 = success
- 1 = generic failure (uncaught exception)
- 2 = invalid user input / validation failure
- 3 = precondition not met (lock held, environment mismatch)
- 4 = external system failure (DB unreachable, network error)

Emit concise error messages to stderr, optionally followed by a hint line. For multi-error validation, aggregate and show an ordered list. Never mix partial success with exit code 0 unless all primary intents succeeded; instead surface a summary (e.g., 7/10 items processed) and return non‑zero if critical thresholds failed.

## Progress & Long-Running Tasks
For commands that can run longer than a few seconds (queue workers, schedulers, scaling monitors):
- Offer watch or streaming modes (`--watch`, `--streaming`).
- Periodically flush progress updates without overwriting when output might be redirected.
- Provide termination signals (Ctrl+C) that trigger graceful shutdown hooks (flush metrics, release locks, persist checkpoints).

## Concurrency Controls
When a command could be invoked concurrently (e.g., via cron on multiple hosts), incorporate one of:
- Distributed lock acquisition with lease renewal
- Idempotent job markers (record execution window + hash)
- File system sentinel (development only)

Fail fast with a clear message if concurrency guard denies execution, using exit code 3.

## Authoring Custom Commands
High-level workflow:
1. Decide intent & name (`generate:report`, `security:scan`).
2. Define signature (arguments & options) emphasizing clarity and minimal mandatory input.
3. Inject required services (repository, validators, formatters) via constructor.
4. Validate input early; return code 2 with guidance on correction.
5. Delegate business logic to services (keeps command thin & testable).
6. Format output with consistent mode negotiation (`--json`, `--format`, or default heuristics).
7. Emit metrics (duration, success/failure) and trace spans if enabled.
8. Cover with tests (argument parsing, validation errors, success path, error path, JSON contract snapshot).

## Testing Patterns
- Use a dedicated test harness that boots a minimal container.
- Mock external side effects (filesystem, network) at service boundary not inside the command.
- Assert exit codes, stderr messages, and JSON schema shape.
- For long-running watchers, inject a controllable clock or iteration cap.

## Observability & Metrics Integration
Emit standardized metrics:
- `cli.command.duration{command="name"}` (histogram)
- `cli.command.failures{command="name",code="X"}` (counter)
- `cli.command.invocations{command="name"}` (counter)

Add structured log fields: `command`, `arguments`, sanitized `options`, `duration_ms`, `exit_code`, and correlation id if present. Avoid logging raw secrets or full payloads (mask token-like patterns).

## Performance Considerations
- Defer heavy service instantiation until after argument validation.
- Cache reflection metadata for command discovery.
- Keep the bootstrap path lean: only register commands necessary for the environment (development extras behind config flags).
- Use streaming writes for large result sets rather than building giant in-memory tables.

## Anti‑Patterns
- Burying domain logic directly in the command body (hard to reuse & test)
- Overloading a single command with many sub-actions better expressed as separate commands
- Emitting inconsistent field names across JSON outputs
- Throwing unhandled exceptions for user mistakes instead of validation errors
- Silent partial failures (always summarize)

## Security Notes
- Validate and sanitize all user-supplied path fragments before filesystem access.
- Treat `--force` as a bypass for confirmations only, never as permission escalation.
- Redact secrets in echoed output (keys generation should default to hidden unless `--show`).
- Use exit code 3 for environment or policy violations (e.g., production safeguard tripped without `--force`).

## Extensibility Hooks
Extension providers can register commands during their boot phase. To avoid load storms:
- Lazy register only when the console kernel is active.
- Group extension command names under the extension namespace to prevent collisions.
- Provide a summary command (`extension:xyz:summary`) if more than a handful of operational commands are added.

With these conventions, the CLI remains predictable, scriptable, and safe to evolve.

<!-- GENERATED:cli-commands -->
Generated 54 commands across 15 groups.

### archive

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|archive:manage|Comprehensive archive system management and data lifecycle operations|action: Action to perform (archive, status, search, verify, health,…<br>table: Table name (required for archive action)<br>days: Days to archive (default: 90)|-u|--uuid=<value>: Archive UUID for verification or restoration<br>--user=<value>: Filter by user UUID for search<br>--endpoint=<value>: Filter by endpoint for search<br>--start-date=<value>: Start date for search (Y-m-d format)<br>--end-date=<value>: End date for search (Y-m-d format)<br>-l|--limit=<value>: Limit search results<br>-f|--format=<value>: Output format (table, json, csv)<br>-d|--dry-run: Show what would be done without executing<br>-b|--backup: Create backup before archiving<br>-c|--compress: Compress archive files<br>--verify-integrity: Verify archive integrity after creation<br>-p|--parallel=<value>: Number of parallel workers for bulk operations<br>--older-than=<value>: Clean up archives older than specified days|Console\Commands\Archive\ManageCommand|

### cache

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|cache:clear|cache:flush|Clear application cache|-|-t|--tag=<value>: Clear only specific cache tags<br>-f|--force: Force cache clearing without confirmation|Console\Commands\Cache\ClearCommand|
|cache:delete|Delete cached entries by key or pattern|key (req): The cache key to delete (or pattern if using --pattern)|-p|--pattern: Treat key as a wildcard pattern (e.g., "user:*")<br>-f|--force: Force deletion without confirmation|Console\Commands\Cache\DeleteCommand|
|cache:expire|Set new TTL/expiration for cached items|key (req): Cache key to set expiration for<br>seconds (req): Time until expiration in seconds (or use --human-time for r…|--human-time: Parse seconds argument as human-readable time (e.g., 1h30m,…<br>-v|--verify: Verify the operation by checking TTL after setting<br>-f|--force: Force operation without confirmation for destructive actions|Console\Commands\Cache\ExpireCommand|
|cache:get|Get a cached value by key|key (req): The cache key to retrieve|-|Console\Commands\Cache\GetCommand|
|cache:maintenance|Run or queue cache maintenance tasks|-|-o|--operation=<value>: Operation to perform<br>-q|--queue: Enqueue the operation instead of running immediately|Console\Commands\Cache\MaintenanceCommand|
|cache:purge|Purge edge cache content with advanced management features|target: Target to purge (URL, tag, or pattern)|-u|--url=<value>: Purge specific URL from cache<br>-t|--tag=<value>: Purge content with specific cache tag<br>-a|--all: Purge all cached content<br>-b|--batch-file=<value>: File containing URLs/tags to purge (one per line)<br>-d|--dry-run: Show what would be purged without executing<br>-s|--stats: Show cache statistics before and after purge<br>-f|--force: Force purge without confirmation prompts<br>--timeout=<value>: Timeout for purge operations in seconds<br>--provider=<value>: Specific edge cache provider to use|Console\Commands\Cache\PurgeCommand|
|cache:set|Set a cache value with key and optional TTL|key (req): The cache key to set<br>value (req): The value to cache (use --json for JSON values)|-t|--ttl=<value>: Time to live in seconds<br>-j|--json: Parse value as JSON|Console\Commands\Cache\SetCommand|
|cache:status|Show cache system status and statistics|-|-|Console\Commands\Cache\StatusCommand|
|cache:ttl|Get TTL (Time To Live) for cached items|key (req): Cache key to check TTL for|-|Console\Commands\Cache\TtlCommand|

### container

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|di:container:compile|Compile the Glueful container for production optimization|-|-o|--output-dir=<value>: Directory to store compiled container<br>-d|--debug: Compile with debug information (slower but with debugging f…<br>-v|--validate: Validate container configuration before compilation<br>--optimize: Enable maximum optimizations (removes debug info, inlines s…<br>-f|--force: Force recompilation even if cache is fresh<br>-w|--warmup: Warm up the compiled container after compilation|Console\Commands\Container\ContainerCompileCommand|
|di:container:debug|Debug and inspect the DI container services|service: Specific service ID to inspect|-s|--services: List all registered services<br>-a|--aliases: Show service aliases<br>-t|--tags: Show tagged services<br>-p|--parameters: Show container parameters<br>-g|--graph: Show service dependency graph<br>-f|--format=<value>: Output format (table, json, yaml)<br>--show-private: Include private services in output<br>--show-arguments: Show service constructor arguments|Console\Commands\Container\ContainerDebugCommand|
|di:container:validate|Validate container configuration and service definitions|-|-s|--service=<value>: Validate specific service only<br>-i|--check-instantiation: Test actual service instantiation (may have side effects)<br>-c|--check-circular: Check for circular dependencies<br>--check-interfaces: Validate interface implementations<br>-p|--check-providers: Validate service provider configurations<br>--strict: Enable strict validation (fail on warnings)<br>-f|--format=<value>: Output format (table, json, yaml)<br>--fix: Attempt to fix common validation issues automatically|Console\Commands\Container\ContainerValidateCommand|
|di:lazy:status|Show LazyInitializer configured service IDs and optionally warm them|-|--warm-background: Warm background services now<br>--warm-request: Warm request-time services now<br>-f|--format=<value>: Output format (table,json)|Console\Commands\Container\LazyStatusCommand|

### database

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|db:profile|Profile and analyze database queries for performance optimization|query: SQL query to profile (use quotes for complex queries)|-f|--file=<value>: File containing SQL query to profile<br>-p|--params=<value>: Query parameters as JSON string<br>-e|--explain: Include execution plan analysis<br>--patterns: Detect query patterns and provide recommendations<br>-o|--output=<value>: Output format (table, json, detailed)<br>-b|--benchmark=<value>: Run query multiple times for benchmarking<br>-c|--compare=<value>: Compare with another query from file|Console\Commands\Database\ProfileCommand|
|db:reset|Reset database to clean state (drops all tables)|-|-f|--force: Force reset without confirmation prompts<br>--dry-run: Show what would be dropped without executing|Console\Commands\Database\ResetCommand|
|db:status|Show database connection status and statistics|-|-d|--details: Show detailed table information<br>--format=<value>: Output format (table, json, csv)|Console\Commands\Database\StatusCommand|

### extensions

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|create:extension|Create new local extension|name (req): Extension name (e.g., blog, shop)|-|Console\Commands\Extensions\CreateCommand|
|extensions:cache|Build extensions cache for production|-|-|Console\Commands\Extensions\CacheCommand|
|extensions:clear|Clear extensions cache|-|-a|--all: Clear all extension-related caches and temporary files<br>-r|--reset: Full development reset (clear cache, reset discovery, inval…|Console\Commands\Extensions\ClearCommand|
|extensions:disable|Disable extension (development only)|extension (req): Extension provider class or slug|-|Console\Commands\Extensions\DisableCommand|
|extensions:enable|Enable extension (development only)|extension (req): Extension provider class or slug|-|Console\Commands\Extensions\EnableCommand|
|extensions:info|Show detailed extension information|slugOrClass (req): Extension slug or provider FQCN|-|Console\Commands\Extensions\InfoCommand|
|extensions:list|List all discovered extensions with status|-|-|Console\Commands\Extensions\ListCommand|
|extensions:summary|Show startup summary and diagnostics|-|-|Console\Commands\Extensions\SummaryCommand|
|extensions:why|Explain why/how a provider was included or excluded|provider (req): Provider class name to analyze|-|Console\Commands\Extensions\WhyCommand|

### fields

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|fields:analyze|Show field usage statistics and patterns|-|-d|--detailed: Show detailed analysis including route-by-route breakdown<br>-f|--format=<value>: Output format (table, json, csv)<br>-r|--routes=<value>: Analyze specific routes (can be used multiple times)|Console\Commands\Fields\AnalyzeCommand|
|fields:performance|Performance analysis of field selections|-|-f|--format=<value>: Output format (dashboard, json, metrics)<br>--reset: Reset performance metrics before analysis<br>-w|--watch: Watch mode: continuously display metrics (press Ctrl+C to s…<br>-i|--interval=<value>: Watch mode update interval in seconds<br>-t|--threshold=<value>: Performance threshold in milliseconds for highlighting slow…|Console\Commands\Fields\PerformanceCommand|
|fields:validate|Validate all route field configurations|-|-r|--route=<value>: Validate specific routes (can be used multiple times)<br>--fix: Attempt to fix common validation issues<br>-s|--strict: Enable strict validation mode<br>-f|--format=<value>: Output format (table, json)|Console\Commands\Fields\ValidateCommand|
|fields:whitelist-check|Check whitelist compliance for field selections|pattern: Test a specific field selection pattern against whitelists|-r|--route=<value>: Check specific routes (can be used multiple times)<br>-s|--strict: Enable strict whitelist checking<br>--security: Focus on security-related whitelist issues<br>-e|--export=<value>: Export whitelist analysis to file (json, csv)<br>--suggest-whitelist: Suggest whitelist configurations based on common patterns|Console\Commands\Fields\WhitelistCheckCommand|

### generate

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|generate:api-definitions|Generate complete OpenAPI/Swagger documentation from database schema and route annotations|-|-d|--database=<value>: Specific database name to generate definitions for<br>-T|--table=<value>: Specific table name to generate definitions for (requires -…<br>-f|--force: Force generation of new definitions, even if manual files e…<br>-c|--clean: Clean all existing JSON definitions before generating new o…|Console\Commands\Generate\ApiDefinitionsCommand|
|generate:controller|Generate a REST API controller from template|name (req): The name of the controller to generate (e.g., TaskControlle…|-r|--resource: Generate resource controller with full CRUD methods<br>-a|--api: Generate API-only controller (no create/edit views)<br>-f|--force: Overwrite existing files without confirmation|Console\Commands\Generate\ControllerCommand|
|generate:key|Generate secure encryption keys for the framework|-|--jwt-only: Generate JWT secret key only<br>--app-only: Generate application encryption key only<br>-f|--force: Overwrite existing keys without confirmation<br>--show: Display generated keys (insecure - not recommended for prod…|Console\Commands\Generate\KeyCommand|

### install

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|install|Run installation setup wizard for new Glueful installation|-|--skip-database: Skip database setup and migrations<br>--skip-db: Skip database setup and migrations (alias for --skip-databa…<br>--skip-keys: Skip security key generation<br>--skip-cache: Skip cache initialization<br>-f|--force: Overwrite existing configurations without confirmation<br>-q|--quiet: Non-interactive mode using environment variables|Console\Commands\InstallCommand|

### migrate

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|migrate:create|Create a new database migration file|name (req): The name of the migration (use snake_case format, e.g., cre…|-|Console\Commands\Migrate\CreateCommand|
|migrate:rollback|Rollback database migrations|-|-s|--steps=<value>: Number of migration steps to rollback<br>-f|--force: Force execution in production environment<br>--dry-run: Show what would be rolled back without executing|Console\Commands\Migrate\RollbackCommand|
|migrate:run|Run pending database migrations|-|-f|--force: Force execution in production environment<br>--dry-run: Show what would be executed without running<br>--pretend: Alias for --dry-run<br>-b|--batch=<value>: Specify batch number for grouping migrations<br>-p|--path=<value>: Run migrations from custom directory|Console\Commands\Migrate\RunCommand|
|migrate:status|Show the status of database migrations|-|-|Console\Commands\Migrate\StatusCommand|

### notifications

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|notifications:process-retries|Process queued notification retries|-|-l|--limit=<value>: Maximum number of retries to process<br>--dry-run: Show what would be processed without actually sending notif…<br>-c|--channel=<value>: Process retries for specific channel only (email, sms, etc.)<br>-p|--priority=<value>: Process retries for specific priority only (high, medium, l…|Console\Commands\Notifications\ProcessRetriesCommand|

### queue

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|queue:autoscale|Advanced queue auto-scaling with monitoring and scheduling|action: Action to perform (run, status, config, schedule, resources…|-i|--interval=<value>: Check interval in seconds<br>--no-resource-checks: Disable resource monitoring<br>--no-scheduling: Disable scheduled scaling<br>-s|--streaming: Enable real-time monitoring<br>-j|--json: Output as JSON<br>-d|--detailed: Show detailed metrics<br>--show: Show current configuration<br>--validate: Validate configuration<br>--reload: Reload configuration from file<br>-l|--list: List all schedules<br>-p|--preview: Preview upcoming schedule runs<br>--days=<value>: Number of days to preview<br>--current: Show current resource usage<br>--history: Show resource usage history<br>--trends: Show resource usage trends<br>-f|--format=<value>: Output format (text, json, table)<br>--filter=<value>: Filter output (worker_id, level, message)<br>--export=<value>: Export output to file|Console\Commands\Queue\AutoScaleCommand|
|queue:scheduler|Advanced job scheduling and management system|action: Action to perform (run, work, list, status, add, remove, en…|-i|--interval=<value>: Worker mode check interval in seconds<br>-m|--max-runs=<value>: Maximum number of scheduler runs (0 = unlimited)<br>-j|--job-name=<value>: Specific job name for operations<br>-c|--cron=<value>: Cron expression for job scheduling<br>--command=<value>: Command to execute for new jobs<br>-d|--description=<value>: Job description<br>-t|--timeout=<value>: Job execution timeout in seconds<br>--dry-run: Show what would be executed without running<br>-f|--force: Force job execution even if not due<br>-p|--parallel=<value>: Maximum parallel job executions<br>-o|--output-format=<value>: Output format (table, json, plain)<br>-w|--watch: Watch mode with real-time updates<br>--history=<value>: Show job execution history (last N executions)<br>--filter=<value>: Filter jobs by status (enabled|disabled|running|failed)|Console\Commands\Queue\SchedulerCommand|
|queue:work|Start queue workers with multi-worker support|action: Action to perform (work, spawn, scale, status, stop, restar…|-w|--workers=<value>: Number of workers to spawn<br>-q|--queue=<value>: Queue(s) to process (comma-separated)<br>-m|--memory=<value>: Memory limit per worker in MB<br>-t|--timeout=<value>: Job timeout in seconds<br>--max-jobs=<value>: Max jobs per worker before restart<br>-d|--daemon: Run in daemon mode (keep running)<br>-c|--count=<value>: Number of workers to spawn/scale (for spawn/scale actions)<br>--worker-id=<value>: Specific worker ID (for stop/restart actions)<br>-a|--all: Apply to all workers (for stop/restart actions)<br>-j|--json: Output status as JSON<br>--watch=<value>: Auto-refresh interval in seconds (for status action)<br>--stop-when-empty: Stop when queue is empty|Console\Commands\Queue\WorkCommand|

### security

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|security:check|Check security configuration and show issues|-|-f|--fix: Attempt to automatically fix security issues<br>-v|--verbose: Show detailed information about each check<br>-p|--production: Check production-specific security requirements|Console\Commands\Security\CheckCommand|
|security:lockdown|Manage emergency security lockdown mode|-|-e|--enable: Enable security lockdown mode<br>-d|--disable: Disable security lockdown mode<br>-s|--status: Check current lockdown status<br>-f|--force: Force lockdown operation without confirmation<br>-r|--reason=<value>: Reason for lockdown activation/deactivation<br>-c|--cleanup: Remove all lockdown files when disabling|Console\Commands\Security\LockdownCommand|
|security:report|Generate comprehensive security report|-|-f|--format=<value>: Report format (html, pdf, json)<br>-e|--email=<value>: Email address to send the report to<br>-o|--output=<value>: Output file path for the report<br>--include-vulnerabilities: Include vulnerability assessment in the report<br>--include-metrics: Include security metrics and analytics<br>-d|--days=<value>: Number of days to include in the report|Console\Commands\Security\ReportCommand|
|security:reset-password|Force password reset for specific user|username (req): Username or email of the user whose password should be reset|-f|--force: Force reset without confirmation<br>-n|--notify: Send notification email to the user<br>-t|--temporary=<value>: Generate temporary password (specify length, default: 12)<br>-r|--reason=<value>: Reason for password reset (for audit log)|Console\Commands\Security\ResetPasswordCommand|
|security:revoke-tokens|Revoke authentication tokens|-|-u|--user=<value>: Revoke tokens for specific user only<br>-a|--all: Revoke all tokens for all users (emergency use)<br>-t|--type=<value>: Token type to revoke (access, refresh, all)<br>--older-than=<value>: Revoke tokens older than specified time (e.g., "7 days", "1…<br>-f|--force: Force revocation without confirmation<br>-r|--reason=<value>: Reason for token revocation (for audit log)|Console\Commands\Security\RevokeTokensCommand|
|security:scan|Scan for security vulnerabilities|-|-d|--deep: Perform deep security scan (slower but more thorough)<br>-f|--fix: Attempt to automatically fix detected vulnerabilities<br>-o|--output=<value>: Output scan results to file<br>--format=<value>: Output format (json, html, txt)|Console\Commands\Security\ScanCommand|
|security:vulnerabilities|Check for known vulnerabilities in dependencies|-|-u|--update: Update vulnerability database before checking<br>-f|--fix: Attempt to automatically fix vulnerable dependencies<br>--format=<value>: Output format (json, table, summary)<br>-s|--severity=<value>: Minimum severity level to report (low, medium, high, critic…|Console\Commands\Security\VulnerabilityCheckCommand|

### serve

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|serve|Start the Glueful development server|-|-p|--port=<value>: Port to run the server on<br>--host=<value>: Host to bind the server to<br>-o|--open: Open the server URL in default browser|Console\Commands\ServeCommand|

### system

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|system:check|Validate framework installation and configuration|-|-d|--details: Show detailed information for each check<br>-f|--fix: Attempt to automatically fix common issues<br>-p|--production: Check production readiness and security|Console\Commands\System\CheckCommand|
|system:memory|Advanced memory monitoring and analysis tools|command: External command to monitor (optional)|-i|--interval=<value>: Monitoring interval in seconds<br>-t|--threshold=<value>: Alert threshold in MB<br>-d|--duration=<value>: Maximum monitoring duration in seconds (0 = unlimited)<br>-l|--log: Log memory usage to CSV file<br>-c|--csv-file=<value>: CSV file path for memory metrics<br>-a|--analysis: Perform memory analysis and leak detection<br>-p|--profile: Enable detailed memory profiling<br>--trends: Show memory usage trends and statistics<br>-s|--summary: Show memory summary and recommendations<br>-w|--watch: Watch mode with real-time updates<br>--alert-script=<value>: Script to run when threshold is exceeded<br>-f|--format=<value>: Output format (table, json, plain)|Console\Commands\System\MemoryMonitorCommand|
|system:production|Comprehensive production environment configuration and validation|-|-c|--check: Check production readiness and show issues<br>-s|--score: Show production readiness score (0-100)<br>-f|--fix: Apply automatic fixes for detected issues<br>-t|--template: Apply production template to current .env<br>-m|--migrate=<value>: Migrate configuration to specified environment (development…<br>-a|--audit: Generate comprehensive production audit report<br>--suggestions: Show detailed fix suggestions without applying<br>-b|--backup: Create backup before making changes (default: true)<br>--no-backup: Skip backup creation<br>--force: Skip confirmations and apply changes directly<br>-i|--interactive: Run interactive configuration wizard<br>-d|--dry-run: Show what would be changed without applying<br>-o|--output-file=<value>: Save audit report to file|Console\Commands\System\ProductionCommand|

### version

| Command | Description | Arguments | Options | Class |
|---------|-------------|-----------|---------|-------|
|version|--version|-V|Display Glueful Framework version information|-|-s|--system: Show detailed system information including PHP version and …<br>-j|--json: Output version information in JSON format|Console\Commands\VersionCommand|

<!-- END GENERATED:cli-commands -->

## Overview
High-level command model, execution lifecycle, and patterns for safe operational automation. Use this section to orient before diving into specific command groups.

## Core Types
| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|
| ConsoleCommand | Base Class | Abstract base every command extends | Provides signature & handle contract |
| Signature | Value Object | Parsed representation of name, description, args, options | Built at registration time |
| Argument | Descriptor | Positional required/optional input | Auto-casting & validation |
| Option | Descriptor | Flag or key/value modifier | Supports short & long forms |
| CommandIO | Service | Normalized input + output helpers | Color, tables, JSON, verbosity |
| ProgressBar | Utility | Streaming progress feedback | Optional for long tasks |
| LockManager | Service | Distributed execution coordination | Used by migration / scheduler commands |
| Stopwatch | Utility | Duration measurement | Feeds metrics layer |

## API Surface
### Creation
1. Extend `ConsoleCommand` (or framework base) and define `protected static string $name` & description metadata.
2. Implement `define()` to declare arguments/options with fluent DSL.
3. Inject dependencies via constructor (container autowires).
4. Implement `handle(CommandIO $io): int` returning exit code.

### Usage
Execution flow: bootstrap → discover commands → parse input → validate → resolve deps → pre-hooks (metrics start) → handle → post-hooks (emit metrics, flush logs) → exit code.

### Extension Points
- Output formatters (register new formatter keyed by `--format`)
- Global pre/post hooks (audit, tracing, security policy)
- Custom validators for complex argument patterns
- Command discovery (additional directories / extension providers)

## Configuration
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| cli.default_format | string | table | Fallback output style |
| cli.verbosity | string | normal | Global default verbosity (quiet, normal, verbose) |
| cli.max_runtime | int | 0 (unlimited) | Optional guard for long-running commands |
| cli.history_enabled | bool | true | Persist last N executed commands (dev only) |
| cli.lock.ttl | int | 300 | Default lock lease (seconds) for guarded commands |
| cli.json.pretty | bool | false | Pretty print JSON output |
| cli.autocomplete.enabled | bool | true | Enable shell completion generation |

## Examples
### Minimal Read-Only Command
```
class VersionCommand extends ConsoleCommand {
  protected static string $name = 'app:version';
  public function define(): void {
    $this->describe('Show application version');
  }
  public function handle(CommandIO $io): int {
    $io->writeln(app()->version());
    return 0;
  }
}
```

### Command With Arguments, Options, JSON Output & Dry Run
```
class PurgeCommand extends ConsoleCommand {
  protected static string $name = 'cache:purge-keys';
  public function define(): void {
    $this->describe('Purge cache keys by pattern')
      ->argument('pattern', 'Key pattern (e.g. user:*)')
      ->option('dry-run', 'd', 'Preview without deletion')
      ->option('format', 'f', 'Output format (table,json)', 'table');
  }
  public function handle(CommandIO $io, CacheRepository $cache): int {
    $pattern = $io->arg('pattern');
    $dry = $io->opt('dry-run');
    $keys = $cache->scan($pattern);
    if ($dry) {
      return $io->render($keys, 'Keys that would be deleted', 0);
    }
    $deleted = 0; foreach ($keys as $k) { $cache->delete($k); $deleted++; }
    $io->success("Deleted {$deleted} keys");
    return 0;
  }
}
```

## Error Conditions
| Condition | Symptom | Recommended Handling | Exit Code |
|-----------|---------|----------------------|-----------|
| Unknown Command | Name not registered | Suggest closest matches | 1 |
| Invalid Argument Count | Missing required positional | Show usage synopsis | 2 |
| Invalid Option Value | Parse/cast failure | Show offending option & expected type | 2 |
| Concurrency Guard Active | Lock already held | Advise retry/backoff | 3 |
| External System Unavailable | DB / cache unreachable | Short circuit after backoff | 4 |
| Unhandled Exception | Stack trace (dev) | Log & sanitize message in prod | 1 |

## Observability & Metrics
Emitted metrics (if metrics subsystem enabled):
| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| cli.command.duration | histogram | command | Execution latency |
| cli.command.invocations | counter | command | Total runs |
| cli.command.failures | counter | command,code | Failures grouped by exit code |
| cli.command.lock_wait | histogram | command | Time spent waiting for lock |

Tracing: one span per command with attributes: `cli.command`, `cli.args.count`, `cli.options`, `cli.exit_code`.

## Performance Notes
| Concern | Mitigation |
|---------|------------|
| Cold bootstrap time | Avoid loading heavy subsystems until a command needing them runs |
| Reflection overhead | Cache signature parsing results |
| Large output sets | Stream rows; paginate or support `--limit` |
| Repeated service warmup | Use shared singleton services where safe |
| Excessive JSON formatting cost | Offer `--format=plain` for high-frequency automation |

## Related
Concepts: Service Container & Autowiring, Scheduler & Locks (for guarded commands), Events (emitting operational events), Observability (metrics & tracing), Database (profiling & migrations).
