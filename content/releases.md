---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

## v1.91.0 - Alshain
**Released: October 27, 2026**

::u-alert{color="error" variant="subtle" icon="i-tabler-alert-octagon"}
#description
**Minor with breaking changes: features that do what they say.** A framework-wide correctness
sweep from a full audit of the docs against the code. High risk: security settings that were
silently ignored now apply, the ORM behaves as documented, and several APIs, options and config keys
are removed. Read the [Upgrading](/upgrading#upgrading-to-191) guide before you update.
::

### Key Highlights

::card
#title
Security settings that were ignored now apply
#description
The `csrf` middleware is built from `config/security.php` — token lifetime, double-submit and
`exemptRoutes`, which now match under the API prefix (the shipped webhook entry is narrowed to
`webhooks/inbound/*`). Login and `GET /csrf-token` tokens are session-bound and validate. CORS
origin patterns apply to real responses, not only preflight. Routes served from the route cache
keep their `#[RequireScope]`, rate limits and `#[Fields]` — scoped routes from the cache used to let
requests through.
::

::card
#title
Routing and auth do what the attributes say
#description
`#[RateLimit]` / `->rateLimit()` and `#[Fields]` attach their middleware; `rate_limit:` honours its
third (`by`) parameter. Stacked `#[RequiresRole]` means any one role. JWTs pass `#[RequireScope]` by
their scopes (including space-delimited `scope` claims). `requirePermission()` works without a
permission provider. `POST /auth/login` with `"auth_transport": "cookie"` issues browser-session
cookies, and same-site SPAs can refresh and log out.
::

::card
#title
The ORM works as named
#description
Timestamps save without casts; `withTrashed()`, `onlyTrashed()`, `restore()` and `forceDelete()`
work; every model event reaches its callbacks and `false` cancels. `belongsToMany` eager loading,
`detach()`/`sync()`/`toggle()`, nested and through eager loads, `withCount()`, `whereHas()` closures
and `loadCount()` are fixed, and `paginate()` returns models with eager loads. `AsEncryptedString`
moves to `EncryptionService` (AES-256-GCM under `APP_KEY`) and still reads legacy values.
::

::card
#title
Subsystems wired end to end
#description
Webhooks ship a migration, an event bridge for `#[Webhookable]`, management routes and one signing
scheme. `#[AsListener]` registers listeners. Scheduled notifications keep their channels; a new
`queue_maintenance` job prunes failed jobs. The redis and database lock stores work on a stock
install, the file cache supports tags, and request, response, cache and query events dispatch when
something listens. `unique:`/`exists:`, `nullable` and `sometimes` validation rules take effect.
::

::card
#title
Config that did nothing is removed or honoured
#description
Unread keys are removed (cache `lock_ttl`/`enable_tags`/`distributed`/`tags_store`,
`lock.retry.times`, `capabilities.metrics`/`scheduler`, tracing `driver`/`service_*`).
`API_RATE_LIMITING_ENABLED`, `api.field_selection.enabled`, `LOG_LEVEL`, `TRACING_ENABLED`,
`queue.failed.*`, `lock.ttl`, MySQL `ssl.*` and the webhook signing keys now take effect.
::

### Migration Notes

- Run the migrations (new `webhooks` leaf) and clear the route cache (format v3) on deploy.
- Apps with their own `config/schedule.php` must add the `scheduled_notifications` and
  `queue_maintenance` jobs; apps with their own `config/security.php` should change `webhooks/*` to
  `webhooks/inbound/*` and mount inbound receivers under `/webhooks/inbound/<provider>`.
- Removed: `Utils::buildSearchConditions()` (use `whereContains()`),
  `FailedJobProvider::setMaxRetries()`/`getMaxRetries()`, `queue:scheduler`
  `add|remove|enable|disable|history` and `--parallel`.
- ORM: `paginate()['data']` is a model Collection; `forceDelete()` permanently deletes; returning
  `false` from a cancellable event cancels the write.
- `unique:`/`exists:` rules are enforced and throw without a connection; expect new 422s where
  invalid data used to pass.
- Behaviour that now switches on: CSRF exemptions and lifetimes, CORS patterns, `LOG_LEVEL`
  filtering, rate limits from attributes, webhook dispatch from `#[Webhookable]`.

The full checklist, with before/after snippets, is in [Upgrading](/upgrading#upgrading-to-191).

```bash
composer update glueful/framework
php glueful migrate:run
php glueful route:cache:clear
```

---

## v1.90.0 - Alsciaukat
**Released: October 11, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
**Minor: the file cache and `.env` stay usable when the web server cannot write the code.**
Moderate risk: the framework config's default file-cache path changed from the framework's own
folder to the app's `storage/cache`.
::

### Key Highlights

::card
#title
The file cache lives in your app
#description
The cache service was created without the application context, and the file driver looked up a
config key no app defines, so file-cache entries were written to
`vendor/glueful/framework/storage/cache`. Where the web server cannot write the code — the safe way
to run a production site — the cache failed to start and requests ran without it. The driver now
uses `cache.stores.file.path` (`CACHE_FILE_PATH`), else `<app>/storage/cache`, and services that
create a cache or a logger without a context use the one set at boot.
::

::card
#title
`.env` keeps who can read it
#description
Every write replaced `.env` with a fresh temporary file — mode 0600, in the writing user's own
group — so a web server reading `.env` through its group lost access the moment the deploy user ran
an install or provision. Writes now keep the file's mode and group, and an unchanged file is left
alone.
::

### Migration Notes

- An app whose `config/cache.php` sets the file-cache path (the API skeleton does) is unaffected.
- An app relying on the framework's default now caches in `<app>/storage/cache`: make sure the web
  server can write it, or set `CACHE_FILE_PATH`. Old entries under `vendor/glueful/framework/storage`
  can be deleted.

```bash
composer update glueful/framework
```

---

## v1.89.0 - Alsafi
**Released: October 11, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Minor: `queue:restart` asks running workers to pick up new code.** Low risk: additive, no
configuration or default changes.
::

### Key Highlights

::card
#title
Restart workers after a deploy
#description
A queue worker is a long-running process that loads the application once, so after an upgrade it
keeps running the old code until it exits. `php glueful queue:restart` stores a timestamp in the
cache; each worker compares it with its own start time and exits after the job it is running, and
its supervisor (systemd, Supervisor) starts it again on the code installed now. A worker started
after the signal keeps running. Without a cache store nothing is signalled.
::

### Migration Notes

- No action needed. Add `php glueful queue:restart` to your deploy or upgrade steps, after the code
  and migrations are in place.

```bash
composer update glueful/framework
```

---

## v1.88.5 - Alrescha
**Released: October 7, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: an after-commit callback that commits its own transaction no longer loops.** Low risk: no
configuration or default changes.
::

### Key Highlights

::card
#title
After-commit callbacks run once
#description
The outermost commit ran its after-commit callbacks before taking them off the queue. A callback
that opened and committed a transaction of its own (an event listener writing a record, say) found
them still queued and ran them again, over and over, until the request ran out of memory. The data
had already committed, so a client saw a request that never answered for work that had in fact
been saved. Commit and rollback now clear a level's callbacks before running them, and a rollback
callback's own transaction no longer runs the rolled-back work's after-commit callbacks.
::

### Migration Notes

- No action needed. Each after-commit and after-rollback callback now runs exactly once.

```bash
composer update glueful/framework
```

---

## v1.88.4 - Alrescha
**Released: October 5, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: large resized images no longer fail after their first request.** Low risk: no
configuration or default changes.
::

### Key Highlights

::card
#title
A cached image variant is always readable
#description
The image route caches each resized variant. On Redis, the cache's serializer wrote values of any
size but refused anything over its 1MB limit when reading, so a variant over 1MB was served once
and answered 500 on every request after. The serializer now enforces the limit when writing too,
the Redis driver answers `false` from `set()` for a value it cannot store and treats an entry it
cannot read as a miss, and the image route renders a variant again when the cache cannot answer.
::

### Migration Notes

- No action needed. Variants already cached over the limit are rendered again. A variant over the
  cache limit is now served uncached, so it is rendered on each request.
- `RedisCacheDriver::set()`, `setNx()` and `mset()` return `false` for a value the serializer
  refuses, instead of storing it; code that relied on such a write had a value it could never read.

```bash
composer update glueful/framework
```

---

## v1.88.3 - Alrescha
**Released: October 3, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: enabling an extension over HTTP takes effect under OPcache.** Low risk: no configuration
or default changes.
::

### Key Highlights

::card
#title
The extension files are invalidated when written
#description
`config/extensions.php` and `bootstrap/cache/extensions.php` are PHP files the framework writes
and then requires. Under PHP-FPM with OPcache, a web request that enabled an extension could
rebuild the cache from OPcache's compiled old list, so the next request booted without the
extension. `ExtensionStateWriter` and the extension cache writer now call `opcache_invalidate()` on
the file they wrote.
::

### Migration Notes

- No action needed. A change made from the CLI (`extensions:enable`, `extensions:cache`) reaches
  PHP-FPM when OPcache next checks the file's timestamp; with `opcache.validate_timestamps=0`,
  reload PHP-FPM after it.

```bash
composer update glueful/framework
```

---

## v1.88.2 - Alrescha
**Released: October 3, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: a new project installs cleanly.** `composer create-project` no longer fails at its
`extensions:cache` step before the database is configured. Low risk: no configuration or default
changes.
::

### Key Highlights

::card
#title
The extension-state lock needs no database
#description
The lock every change to the enabled extension list holds guards files (`config/extensions.php`
and the extension cache), so it is now an flock on `storage/framework/locks/extension-state.lock`
on every database driver. In 1.88.0 and 1.88.1 it was a PostgreSQL advisory lock on PostgreSQL,
which made `extensions:cache` need a database: a fresh project failed at that step while `.env`
still held placeholder credentials. The lock is re-entrant within a process.
::

### Migration Notes

- No action needed. `ExtensionStateMutex::within()` still accepts its `$db` argument and ignores
  it; an application that passed one can stop.

```bash
composer update glueful/framework
```

---

## v1.88.1 - Alrescha
**Released: October 3, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: a change to the extension list that can't get the lock says so.** Low risk: no
configuration or default changes.
::

### Key Highlights

::card
#title
Extension-list lock timeouts are lock contention
#description
When `ExtensionStateMutex` times out because another change to the extension list is still
running, it now throws `LockContentionException` (still a `RuntimeException`), so a caller can
answer "busy, try again" rather than reporting a bad request. The schema executor's `enable()` and
`disable()` record that operation as failed, with the reason, instead of leaving it running.
::

### Migration Notes

- No action needed. Code that catches `RuntimeException` keeps working; catch
  `LockContentionException` to tell contention apart.

```bash
composer update glueful/framework
```

---

## v1.88.0 - Alrescha
**Released: October 3, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Minor: route tables that know the state they were compiled under, and one lock for every change
to the enabled extensions.** An application can add its own state to the compiled route table's
signature, and every command that edits `config/extensions.php` or rebuilds the extension cache now
holds the same lock. Low risk: additive, with no configuration or default changes.
::

### Key Highlights

::card
#title
Route-table signature inputs
#description
`ApplicationContext::setRouteSignatureInput($name, $value)` adds application state to the
compiled route table's signature. A table compiled under one state is rejected by a context booted
under another, including a table first built on a cold cache. Set it before routes are registered,
from the state the routes are registered by.
::

::card
#title
One lock for every enabled-list change
#description
`extensions:enable`, `extensions:disable`, `extensions:cache` and the schema executor hold
`ExtensionStateMutex` from reading the list (or resolving providers) through rebuilding the
extension cache, so two changes can't overwrite each other's edits. It's a PostgreSQL advisory lock
on `glueful:extension-state`, or a file lock on other drivers. Applications that write the list
themselves take the same lock with `ExtensionStateMutex::within()`; `ExtensionManager::rebuildCache()`
is the locked rebuild.
::

### Migration Notes

- No action needed. An application that edits `config/extensions.php` or rebuilds the extension
  cache itself should do it inside `ExtensionStateMutex::within()`.

```bash
composer update glueful/framework
```

---

## v1.87.0 - Alrakis
**Released: September 22, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-tool"}
#description
**Minor: responses carry security headers, uploads keep their promises, and search matches what
you typed.** Every response now gets `X-Content-Type-Options: nosniff` and a referrer policy where
it set none. Uploaded images are stripped of their embedded metadata, deleted uploads are purged
after a grace period, and a resized image follows its blob when the file changes. Text search
folds case on every database and treats `%` and `_` literally. Mail no longer pretends to be
configured. Moderate risk: read the Migration Notes; mail needs `MAIL_HOST` and `MAIL_FROM`, and
image metadata is removed by default.
::

### Key Highlights

::card
#title
Baseline security headers on every response
#description
The `security_headers` middleware is opt-in per route, so JSON API responses and the API reference
went out with no headers at all. The response chokepoint that applies CORS and the CSP now adds
`X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` wherever a
response has not set them (`Glueful\Http\BaselineSecurityHeaders`). Framing and HSTS stay per
route and with whatever terminates TLS.
::

::card
#title
Uploads that do what the config says
#description
`uploads.security.strip_exif` was on and read by nothing: a phone photo kept its GPS position.
JPEG, PNG and WebP uploads are now stripped of EXIF, XMP, IPTC and comments before storage,
without re-encoding (`ImageMetadataStripper`). Deleting a blob only marked it; `blobs:purge` and the
`blob_purge` job now remove the file and then the row after `uploads.purge_deleted_after_days`
(30). A resized variant and its ETag are versioned by the blob's size and update time.
::

::card
#title
Search that matches what you typed
#description
`LIKE '%term%'` from user input was case-sensitive on PostgreSQL and treated `%` and `_` as
wildcards. The query builder gains `whereContains()`, `orWhereContains()`, `whereStartsWith()` and
`whereEndsWith()`, which lower-case both sides and escape the term; search and the `contains`,
`starts` and `ends` filters use them.
::

::card
#title
Honest mail and console
#description
`services.mail` no longer defaults to `smtp.mailtrap.io` and `noreply@glueful.com`, so an app that
never set up mail reports it unavailable. The console logs a command name two packages claim,
gives a discovered command the booted container, and rediscovers the production command manifest
when the framework version changes.
::

### Migration Notes

- **Set `MAIL_HOST` and `MAIL_FROM`** if your app sends mail; without them the email channel reports
  itself unavailable.
- **List `blob_purge` in your `config/schedule.php`** to purge deleted uploads (an app's schedule
  replaces the framework's list). `UPLOADS_PURGE_DELETED_AFTER_DAYS` sets the grace period.
- **Uploaded images lose their metadata by default.** Set `UPLOADS_STRIP_EXIF=false` to keep it.
- **PostgreSQL searches now match any case**, and `%` or `_` in a term is matched literally. A
  custom `WhereClauseInterface` implementation must add the four text-match methods.
- **Deprecated:** `Utils::buildSearchConditions()` (it writes the term into raw SQL unescaped); use
  `QueryBuilder::whereContains()`. Removal in 1.88.

```bash
composer update glueful/framework
```

---

## v1.86.2 - Alpherg
**Released: September 22, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: an empty array in config adds nothing again.** 1.86.0 made a config list replace the
list below it, and PHP counts `[]` as a list, so a package that ships a key as `[]` wiped the value
another package or the app contributed to it (in Thallo, the uploads root admin imports read their
file from). An empty array now leaves the value below it alone, as it did before 1.86.0; a
non-empty list still replaces. Low risk: restores the earlier meaning of `[]`.
::

### Migration Notes

- None. Upgrade from 1.86.0 or 1.86.1.

```bash
composer update glueful/framework
```

---

## v1.86.1 - Alpherg
**Released: September 22, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: a job that releases itself is retried.** The worker runs a fresh instance of the job
class, with no driver, so a job's own `release($delay)` (a scheduled retry) only set a flag: the
queue wrapper deleted the row and the job never ran again. A failed webhook delivery was marked
"retrying" and never retried. `DatabaseJob` and `RedisJob` now carry out the release on the
queued job, with the delay the job asked for. Low risk: no behaviour change beyond scheduled
retries running.
::

### Migration Notes

- None.

```bash
composer update glueful/framework
```

---

## v1.86.0 - Alpherg
**Released: September 22, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-tool"}
#description
**Minor: webhooks deliver, failed jobs come back, and config means what it says.** Webhook
deliveries failed to queue on every dispatch; they now reach the queue, and a test send is guarded
against private addresses. Failed queue jobs can be listed, retried and removed on the database
and Redis drivers. An ORM-created model carries its real id, stored text is never refused as SQL,
and the scheduled backup takes a real dump. App config lists now replace the framework's instead
of merging by position. Moderate risk: read the Migration Notes; `security:check` can now fail
where it passed, and a custom `config/schedule.php` no longer inherits framework jobs.
::

### Key Highlights

::card
#title
Webhooks that deliver
#description
`WebhookDispatcher` and `Webhook::retry()` handed `QueueManager::push()` a job object where it
takes a class name, so every delivery stayed `pending` and Retry answered 500. Both now go through
`DeliverWebhookJob::enqueue()`. Deleting a subscription deletes its deliveries,
`api.webhooks.cleanup` is honoured by `webhook:cleanup` and a daily `webhook_cleanup` job, and
`Webhook::test()` applies the delivery's destination guard before any request.
::

::card
#title
`queue:failed`, `queue:retry`, `queue:forget`, `queue:flush`
#description
A job that used its attempts had no way back. The four commands work on any connection whose driver
implements `Glueful\Queue\Contracts\FailedJobStore` (database and Redis). A retry verifies the
stored payload's signature, so an altered payload is refused, never re-signed. `FailedJobProvider`
now works against the stock `queue_failed_jobs` table, and two workers never claim the same job.
::

::card
#title
What you store is what you get
#description
`Model::create()` set the new key from the insert's row count, so every auto-increment model came
back with id 1; the new `insertGetId()` reads the real id. `QueryValidator` no longer refuses bound
values that read like `"; delete …"` or warn on values over 64 KB. `DatabaseBackupTask` reads the
stock `engine` / `pgsql` config and fails its job when no dump is made.
::

::card
#title
Config that means what it says
#description
Config files were layered with `array_replace_recursive`, which merged lists by position: an app's
third scheduled job took the keys it lacked from the framework's third. Lists now replace; maps
still merge. Dead keys are gone, scheduled jobs get their settings, `security:check` runs the five
checks it used to fake, and `permissions:diff` counts permissions enforced by middleware named in
`permissions.enforcing_middleware`.
::

### Migration Notes

- **Your `config/schedule.php` list replaces the framework's.** Add any framework job you relied on
  inheriting, and the new `webhook_cleanup` job if you want it.
- **Delete the dead config** from your copies: the `sync`/`null` queue connections, the schedule's
  `settings` block, `queue_mapping` and per-job `queue`/`timeout`/`retry_attempts`,
  `app.force_https`, `security.headers`, and `HSTS_HEADER`, `FORCE_HTTPS`, `SCHEDULE_QUEUE_*`,
  `MAIL_BCC`. Leaving it changes nothing.
- **Run `security:check` and fix what it now reports.**
- **The scheduled backup needs `pg_dump` or `mysqldump`** on the scheduler host.
- **Enforce permissions in route middleware?** List it in `permissions.enforcing_middleware`.
- **Deprecated:** `FailedJobProvider::setMaxRetries()` / `getMaxRetries()` (nothing enforces them;
  removal in 1.88).

```bash
composer update glueful/framework
```

---

## v1.85.8 - Alphard
**Released: September 15, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: a scheduled framework job never fails its tick on the logger lookup.** With their
context restored in 1.85.7, `NotificationRetryJob`, `SessionCleanupJob`, `LogCleanupJob`,
`CacheMaintenanceJob` and `DatabaseBackupJob` resolved `LogManager` from the container
unguarded, and a container that binds none — a skeleton install — failed every due tick with
`Service 'Glueful\Logging\LogManager' not found`, so `queue:scheduler run` still failed every
tenth minute on a fresh install. The five jobs share one guarded lookup that falls back to the
static instance. Low risk: no behaviour change beyond the jobs running as intended.
::

### Migration Notes

- None.

```bash
composer update glueful/framework
```

---

## v1.85.7 - Alphard
**Released: September 15, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: scheduled framework jobs keep the application context.** `JobHandlerResolver` hands
the context to a job's constructor, but `NotificationRetryJob`, `SessionCleanupJob`,
`LogCleanupJob`, `CacheMaintenanceJob` and `DatabaseBackupJob` overrode that constructor
without the parameter and dropped it. The notification retry job then threw
`NotificationContextRequiredException` on every due tick, so `queue:scheduler run` failed
every tenth minute on a fresh install; the others ran context-less. Every one now forwards
the context. Low risk: no behaviour change beyond the jobs running as intended.
::

### Migration Notes

- None.

```bash
composer update glueful/framework
```

---

## v1.85.6 - Alphard
**Released: September 13, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
**Patch: an SVG served with a width hint is the original, not a 422.** `GET /blobs/{uuid}?width=160`
sent every `image/*` blob through the resizer, whose raster validator only knows JPEG, PNG, GIF
and WebP, so any thumbnail request for an SVG answered `422 Unprocessable Content`. Only raster
formats take the variant path now; SVG falls through to the original bytes with the resize
parameters ignored. Low risk: no behaviour change for raster images.
::

### Migration Notes

- None.

```bash
composer update glueful/framework
```

---

## v1.85.5 - Alphard
**Released: September 13, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
**Patch: a failed token generation can no longer poison every later login.** When JWT generation
threw (a missing or invalid key), the provider answered empty tokens, a session was stored anyway,
and a refresh token of `""` was issued; its constant hash made every later login answer
`409 A conflicting record already exists`, unlogged. Empty tokens are a failed login now, the
refresh-token store refuses an empty token, the cause is logged, and unique-constraint violations
are reported at warning. Moderate: an install already affected must delete the poisoned row once.
::

### Migration Notes

- If logins on an install answer 409 today, delete the poisoned rows once, then log in again:

```sql
-- the token rows reference the sessions, so they go first
CREATE TEMP TABLE poisoned AS SELECT session_uuid FROM auth_refresh_tokens
  WHERE token_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
DELETE FROM auth_refresh_tokens
  WHERE token_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
DELETE FROM auth_sessions WHERE uuid IN (SELECT session_uuid FROM poisoned);
```

- Then fix what made generation throw: the log now names it (`[Auth] Token generation failed: …`).

```bash
composer update glueful/framework
```

---

## v1.85.4 - Alphard
**Released: September 12, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
**Patch: jobs declared in `config/schedule.php` now actually run.** The scheduler registered each
config job as a callback that only returned its handler class name, so `queue:scheduler run`
logged "Executed job (0ms)" and never ran the handler — every config-declared job was a no-op
unless persisted to the database. Config jobs now resolve and run their handler like database
jobs, `enabled => false` is honoured, the command hands the scheduler the booted context, and
`list` tolerates a missing `enabled` key. Moderate: jobs you believed were running will start
running on the next tick.
::

### Migration Notes

- **Review `config/schedule.php`** before upgrading: every enabled job will now execute on its
  cron expression. Set `enabled => false` on any you do not want.
- Make sure a cron entry ticks the scheduler: `* * * * * php /path/to/app/glueful queue:scheduler run`.

```bash
composer update glueful/framework
```

---

## v1.85.3 - Alphard
**Released: September 12, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: the boot environment is read the way `env()` reads everything else.** `Framework::create()`
and console commands chose the environment from `$_ENV['APP_ENV']` alone, so a process-exported
`APP_ENV` (a CI job, a container) was ignored: a CLI run booted as the wrong environment, skipped
its `config/{env}/` overrides, and `extensions:cache` compiled the wrong provider list for whoever
booted next. The extension cache now records the environment it was compiled for and is not
consumed under another one outside production. Low risk: an exported value that was ignored is
honoured now, and older bare-list caches still load.
::

### Migration Notes

- **Skeleton bootstraps:** pass `env('APP_ENV', 'development')` to `withEnvironment()` instead of
  `$_ENV['APP_ENV'] ?? 'development'`.
- Rebuild the extension cache on deploy as usual (`php glueful extensions:cache`); the new file
  shape is read by this release and the bare-list shape remains readable.

```bash
composer update glueful/framework
```

---

## v1.85.2 - Alphard
**Released: September 12, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: `env()` sees variables the real process environment holds.** It read `$_ENV` alone,
which PHP fills only when `variables_order` includes "E", and Dotenv skips keys the real
environment already holds — so a CI job or container exporting `DB_*` fell to the sqlite default
for a fresh install's first connections. `env()` now also reads `$_SERVER` and `getenv()`. Low
risk: a value that was invisible before is honoured now.
::

### Migration Notes

- **No action required.** Tests that want a key absent must clear the real environment too
  (`putenv('KEY')`).

```bash
composer update glueful/framework
```

---

## v1.85.1 - Alphard
**Released: September 12, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: `migrate:run` adopts previous sources even with nothing pending.** The command returned
at "No pending migrations found" before adoption ran, so an up-to-date database kept its rows
under a lane's previous source names. Low risk: only lanes declaring `previous_sources` are
affected.
::

### Migration Notes

- **No action required.**

```bash
composer update glueful/framework
```

---

## v1.85.0 - Alphard
**Released: September 12, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-arrows-exchange"}
#description
**Minor: migrations can change owner without breaking existing databases.** A migration lane may
declare the source names its files were recorded under before (`previous_sources`); rows under
those names count as applied and are adopted under the current source on the next run. Low risk:
an optional key, no behaviour change without it.
::

### Key Highlights

::card
#title
`previous_sources` in the manifest, or from a provider
#description
`{ "id": "default", "path": "database/migrations", "priority": "default", "mode": "core",
"previous_sources": ["app"] }` in `extra.glueful.migrations`, or
`$this->loadMigrationsFrom($dir, $priority, 'vendor/name', ['old/name'])`. Rows the ledger holds
under a previous source count as applied for the lane, so nothing re-runs and nothing looks
pending.
::

::card
#title
Adoption, scoped to what the lane ships
#description
The next `migrate:run` (or `migrateSources()`) rewrites those rows to the current source — only
for files the lane actually contains, so a previous source that is still a live lane of its own
(the skeleton's `app`) keeps every other row. After one run on an existing install the key is
inert; fresh installs never see it.
::

### Migration Notes

- **No action required.** Use the key when your package takes over migrations previously
  recorded under another source: an application that became a package, a rename, a split lane.

```bash
composer update glueful/framework
```

---

## v1.84.0 - Alnitak
**Released: September 11, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-route"}
#description
**Minor: the API reference moves from `/docs` to `/api-docs`.** The reference UI and its
`openapi.json` are served at the path in `documentation.route_prefix` (env `API_DOCS_PATH`), and
the default is now `/api-docs`, leaving `/docs` to your application's own documentation.
Moderate risk: links, bookmarks and tooling that used `/docs` need the new address, or set
`API_DOCS_PATH=/docs` to keep it.
::

### Key Highlights

::card
#title
One setting, four consumers
#description
`Glueful\Support\Documentation\ApiDocsPath` resolves the path once. The route group in
`routes/docs.php`, the spec URL embedded in every generated UI page (Scalar, Swagger UI, Redoc),
`app.urls.docs` and the URL `generate:openapi` prints all derive from it — previously four
separate `/docs` literals. Values are normalised to a leading slash and no trailing slash; empty
or `/` means the default.
::

::card
#title
Your `/docs` is yours
#description
A framework that claims `/docs` on every application collides with the most natural place to put
documentation. Applications that publish their own docs at `/docs` — a CMS, a product site — no
longer have to work around the reference UI.
::

### Migration Notes

- **Update links** to the reference (`/api-docs`), or set `API_DOCS_PATH=/docs` to keep the old
  address.
- **Regenerate the UI page** with `php glueful generate:openapi --ui`: a page generated before
  1.84.0 still loads `/docs/openapi.json`.
- Mirror `API_DOCS_PATH=/api-docs` into your `.env.example` if you keep one.

```bash
composer update glueful/framework
```

---

## v1.83.4 - Alnilam
**Released: September 11, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: a mounted SPA document may frame itself and its own `blob:` documents.** The document
CSP had no `frame-src`, so `default-src 'self'` applied and browsers refused an iframe pointing
at a `blob:` URL the page had minted itself — an admin previewing its own rendered output showed
nothing. Low risk: SPA document responses only; no third-party origin is allowed.
::

### Key Highlights

::card
#title
`frame-src 'self' blob:` on the document policy
#description
`SecurityHeaders::DEFAULT_DOCUMENT_CSP` — the policy `SpaMountController` sends with a mounted
SPA's `index.html` — now names `frame-src 'self' blob:`. Framing the same origin and the
document's own blobs is the document's own content. `frame-ancestors 'self'` (being framed) is
unchanged, and a mount's explicit `csp` override still replaces the whole policy.
::

### Migration Notes

- **No action required.** Mounts that pass their own `csp` keep it verbatim; add
  `frame-src 'self' blob:` to it if your SPA previews its own documents in an iframe.

```bash
composer update glueful/framework
```

---

## v1.83.3 - Alnilam
**Released: September 9, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: the production container is compiled once, atomically, under a signed name.** Every
PHP-FPM worker compiled the container on its own boot and rewrote one shared file before
requiring it: a 783 KB write per request, workers requiring a half-written file ("Unclosed '{'
on line 9557") and silently falling back to the runtime container, and — with OPcache not
revalidating timestamps — workers executing whatever version they cached first, long after a
deploy rewrote it. Low risk: the production boot path only.
::

### Key Highlights

::card
#title
`DefinitionSignature` names the artifact
#description
A cheap hash of the definitions (services, aliases, factories by declaration site, tags, the
framework version) becomes `CompiledContainer_<signature>.php` and the compiled class name. A
boot reuses the artifact while nothing changed and compiles a new one — a path OPcache has never
seen — when anything does. Artifacts for other definition sets are pruned.
::

::card
#title
Atomic writes, signed precompiles
#description
The artifact is written to a temp file and renamed into place, so a concurrent worker sees either
nothing or the whole file. `di:container:compile` output now carries `DEFINITIONS_SIGNATURE` and is
used only when it matches the boot's definitions; unsigned artifacts from earlier releases are
treated as stale and skipped.
::

### Migration Notes

- **No action required.** After updating, the first production boot compiles one signed artifact;
  later boots require it. Re-run `php glueful di:container:compile` if you rely on a precompiled
  container — the pre-1.83.3 file is unsigned and will be ignored.

```bash
composer update glueful/framework
```

---

## v1.83.2 - Alnilam
**Released: September 8, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: the Installer publishes freshly written database credentials to the running process.**
A fresh `create-project` boots with the sample's placeholder credentials; the operator types real
ones at the provision prompt. They reached `.env` and the injected migration connection, but any
migration that opens its own connection still read the placeholders and failed with "role
your_database_user does not exist". Low risk: installer-only; nothing changes when `.env`
already held real credentials.
::

### Key Highlights

::card
#title
`ApplicationContext::forgetConfig()`
#description
Drops the cached values for one config name so the next read reloads the file — and the `env()`
values it reads — from the current environment. The Installer calls it for `database` right after
setting the written pairs on `$_ENV`, `$_SERVER` and `putenv`, so pack permission seeds and
Aegis's role seed connect to the real database in the same provisioning process.
::

### Migration Notes

- **No action required.** Installed hosts are unaffected; fresh installs stop failing at migrate
  when credentials are entered at the prompt.

```bash
composer update glueful/framework
```

---

## v1.83.1 - Alnilam
**Released: September 8, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: production recommendations stop spamming the error log and stop degrading health.**
PHP-FPM boots the framework on every request, so each applicable `[security] RECOMMENDATION`
(an empty `CSP_HEADER`, for instance) landed in the error log on every hit, and the health
service folded the same recommendations into a `warning` status that monitors alerted on. Both
were advisory information presented as trouble. Low risk: logging and one optional payload key.
::

### Key Highlights

::card
#title
`RecommendationLog`: once per boot cache
#description
A marker under the app's `storage/cache` records the last set of recommendations logged. The
same set stays silent on later boots; a changed set, an emptied set that later regresses, or a
cache clear logs again. Warnings keep their per-request logging — they signal misconfiguration
that must not go quiet.
::

::card
#title
Health: advisory stays advisory
#description
`HealthService::checkConfiguration()` now returns `status: ok` with the recommendations listed
under their own `recommendations` key; only genuine issues (missing keys, production warnings
such as debug on) fail the check. `convertToSystemCheckFormat()` renders them as
"Recommendation: …" lines for the CLI. The health singleton also rebuilds itself for a
different application context instead of serving a stale base path.
::

### Migration Notes

- **No action required.** The next boot after updating logs the current recommendations one
  more time, then stays quiet until they change. Monitors that alerted on the `warning`
  status for recommendation-only hosts go quiet.

```bash
composer update glueful/framework
```

---

## v1.83.0 - Alnilam
**Released: September 8, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-shield-check"}
#description
**Minor: `CSP_HEADER` now does what its name says.** The variable shipped in every
`.env.example` and was recommended at production boot, yet nothing in the framework read it.
From this release a non-empty value is sent verbatim as `Content-Security-Policy` on every
response that does not already carry a policy, and the new `CSP_REPORT_ONLY=true` switches it
to the report-only header. Moderate risk only for hosts that had already set the variable:
review the value before upgrading. Empty stays a no-op.
::

### Key Highlights

::card
#title
One chokepoint, precedence to the response
#description
`Application::handle()` applies the policy after dispatch and after the exception handler, so
API responses, rendered pages and error pages all carry it — unless they already set their own.
A mounted SPA's document policy (`SecurityHeaders::defaultDocumentHeaders()`), a controller's
explicit header and an extension's middleware all win. No nonces are generated (cached pages
could not carry them) and no other header changes.
::

::card
#title
`CSP_REPORT_ONLY` and an honest boot message
#description
Set `CSP_REPORT_ONLY=true` to send the value as `Content-Security-Policy-Report-Only` and read
violations in the browser console before enforcing. The production recommendation now reads
"CSP_HEADER is empty - no Content-Security-Policy is sent on responses that do not set their
own …" instead of pretending the variable was already wired.
::

### Migration Notes

- **Empty `CSP_HEADER` (the shipped default): no action.**
- **Non-empty `CSP_HEADER`:** it will start being sent. Test it with `CSP_REPORT_ONLY=true`
  first; a policy written for a different app can block inline styles or third-party embeds.
- Mirror `CSP_REPORT_ONLY=false` into your `.env.example` if you keep one.

```bash
composer update glueful/framework
```

---

## v1.82.3 - Alnasl
**Released: September 7, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: the `php -S … router.php` quickstart serves deep links under a mounted SPA.** With
`public/admin/index.html` present, PHP's built-in server resolved `/admin/setup` to that
directory index (`SCRIPT_NAME=/admin/index.html`, `PATH_INFO=/setup`), Symfony inferred
`/admin` as a base path and stripped it, and every admin deep link or reload 404'd locally —
while nginx and Apache served them. Low risk: local development only.
::

### Key Highlights

::card
#title
`router.php` presents the front controller like a real web server
#description
Before requiring `index.php` the script sets `SCRIPT_NAME`, `PHP_SELF` and `SCRIPT_FILENAME`
to the front controller and drops the server-computed `PATH_INFO`, so the application sees
`/admin/setup` exactly as it would behind nginx. Pinned by an end-to-end test that spawns the
built-in server.
::

### Migration Notes

- **No action required.** Restart any running `php -S` after `composer update`.

```bash
composer update glueful/framework
```

---

## v1.82.2 - Alnasl
**Released: September 7, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: a mounted SPA's index.html gets a document Content-Security-Policy, not the
static-asset one.** `SpaMountController` applied `SecurityHeaders::defaultStaticAssetHeaders()`
— whose `style-src 'self'` forbids inline styles — to the HTML document as well. A built
front-end injects style elements at runtime, so the served app lost those styles: a primary
button with no background, in every environment. Low risk: behaviour-restoring.
::

### Key Highlights

::card
#title
`SecurityHeaders::defaultDocumentHeaders()` and the `csp` mount option
#description
index.html now ships `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob:`,
`font-src 'self' data:`, `connect-src 'self'`, with scripts still self-only and
`frame-ancestors 'self'`. Static assets keep the strict asset policy. Pass
`['csp' => '…']` to `serveFrontend()` to set a mount's own document policy.
::

### Migration Notes

- **No action required.** If you had worked around the missing styles with a custom header
  in front of PHP, remove it; the framework now sends a correct document policy itself.

```bash
composer update glueful/framework
```

---

## v1.82.1 - Alnasl
**Released: September 7, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: boot-time re-pins reach the compiled container.** A provider that re-binds a service
after the container is built (`$this->app->load([...])` in `boot()`) used to guard on
`instanceof Glueful\Container\Container`, which the compiled container is not. With 1.82.0
making compilation succeed, such re-pins silently no-op'd in production and the service
reverted to the compiled binding. Low risk: behaviour-restoring.
::

### Key Highlights

::card
#title
`RebindableContainer`
#description
Both the runtime `Container` and every compiled container implement
`Glueful\Container\RebindableContainer`. Its `load()` accepts definitions after construction;
they win over compiled ones and evict a stale singleton. Guard boot-time re-pins on this
interface, never on the concrete container class.
::

### Migration Notes

- **If a provider guards a boot-time `load()` with `instanceof Glueful\Container\Container`**,
  change the guard to `instanceof Glueful\Container\RebindableContainer` — otherwise the
  re-pin skips the compiled container in production.
- **Optional constructor dependencies** (nullable or defaulted) absent from the container now
  resolve to their default / `null` under the compiled container, exactly as at runtime.

```bash
composer update glueful/framework
```

---

## v1.82.0 - Alnasl
**Released: September 7, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-rocket"}
#description
**Minor: the compiled container finally engages, and a never-installed production checkout
boots quietly.** Every production boot used to log `[Container][WARNING] container compilation
failed` and fall back to the runtime container — the framework's own core factories were all
"unsupported" by the compiler. Static factories now compile to direct calls, closure factories
and live objects such as the `ApplicationContext` are handed in after construction, and the
artifact lives under the app's `storage/cache/container`. Separately, a checkout that has not
been installed yet (no security keys) skips the boot-time security validation and resolves
extensions live once, writing the cache, instead of failing with "Extension cache missing".
Moderate risk: production runs a different (faster) container implementation from this
release on; installed hosts are otherwise unchanged.
::

### Key Highlights

::card
#title
Compiled container, hydrated at boot
#description
`ContainerCompiler` emits `'Class::method'` / `[Class::class, 'method']` factories as direct
static calls. What cannot become code — closures, instance factories, the live
`ApplicationContext` — is declared in `RUNTIME_FACTORY_IDS` / `RUNTIME_VALUE_IDS` on the
generated class and injected by `ContainerFactory` via `withRuntimeFactories()` /
`withRuntimeValues()`, on every production boot and for a precompiled container. The
container self-reference compiles to `$this`.
::

::card
#title
First run bootstraps itself
#description
`InstallState::isInstalled()` is true once `APP_KEY`, `JWT_KEY` and `TOKEN_SALT` exist. Until
then a production checkout skips the security validation (its warnings would all be about
state the installer creates) and extension discovery resolves live ONCE and writes the cache.
Once installed, a missing cache is still a deploy mistake and fails loudly.
::

### Migration Notes

- **Compiled container now active in production.** If something behaves differently only in
  production, set `APP_DEBUG=true` to compare against the runtime container and report it.
  Delete `<app>/storage/cache/container/` to force a fresh compile.
- **Recompile a `container:compile` artifact built before 1.82.0** once — it is still loaded
  but carries no runtime values.
- **`FORCE_HTTPS` unset in production** no longer draws a recommendation; unset means enabled.

```bash
composer update glueful/framework
```

---

## v1.81.2 - Alnair
**Released: September 7, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: the production command manifest is app-owned and validated.** The cached console
command list lived in the framework package's own `storage/cache`, which never exists in a
dist install, so every host fell through to one shared `/tmp/glueful_commands_manifest.php`
and loaded it verbatim. A manifest written by an older framework on the same host fed phantom
command classes into every production boot: container compilation failed on the unknown class,
and resolving the tagged commands threw a 500 out of the console. Low risk: behaviour-restoring,
no API change.
::

### Key Highlights

::card
#title
Manifest under the app, validated on load
#description
The manifest now lives in the application's `storage/cache` (a per-user, per-framework-version
temp file only as a fallback). Every cached class is re-checked with `class_exists()`; a stale
manifest is rediscovered and rewritten. `commands:cache` and `commands:clear` operate on the
app path and also retire the two legacy locations.
::

### Migration Notes

- **No action required.** On a host that showed `Cannot compile autowire definition for
  unknown class: …` at boot, the next production boot after updating rewrites the manifest.
  Running `php glueful commands:clear` once removes the old shared temp file explicitly.

```bash
composer update glueful/framework
```

---

## v1.81.1 - Alnair
**Released: September 7, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: providers loaded from the extension cache get `register()` called.** `discover()`
used to construct the cached providers and return, so `register()` ran only on live
discovery — never in production, where the cache is mandatory. Console commands and runtime
bindings registered there silently vanished on every production boot. Low risk:
behaviour-restoring, no API change.
::

### Key Highlights

::card
#title
`register()` runs on every boot
#description
The extension cache decides only *which* providers load. Their lifecycle is the same on both
discovery paths: `register()` during `discover()`, then `boot()`, with the same per-provider
failure handling — logged and skipped in production, rethrown elsewhere.
::

### Migration Notes

- **No action required.** If an extension of yours registers commands or bindings in
  `register()` and they were missing in production, they appear after this update.

```bash
composer update glueful/framework
```

---

## v1.81.0 - Alnair
**Released: September 6, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-bug-off"}
#description
**Minor: the boot profiler dump is opt-in and best-effort.** Every boot used to write a
hard-coded `/tmp/boot_profile.log`. On any host where a different OS user had created that
file first — a second site, or a CLI run as root followed by one as the site user — the
denied write was promoted to a fatal `ErrorException` by the framework's error handler, and
no command (including first-run provisioning) could boot. The dump is now enabled only by
`BOOT_PROFILE_LOG`, and a dump that cannot be written is skipped silently. Low risk: no
framework code read the file; minor only because a default changed and an env var is new.
::

### Key Highlights

::card
#title
`BOOT_PROFILE_LOG`
#description
Unset (the default) writes nothing. `true` writes a per-phase boot timing breakdown to a
per-user file under the system temp directory, so two sites on one host never contend for
a single path. Any other value is taken as an explicit file path. The structured boot
summary still reaches the framework logger exactly as before.
::

### Migration Notes

- **No action required.** If external tooling tailed `/tmp/boot_profile.log`, set
  `BOOT_PROFILE_LOG=/tmp/boot_profile.log` to keep it.

```bash
composer update glueful/framework
```

---

## v1.80.2 - Almach
**Released: August 19, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: untouched migration sources classify `pending`, never `divergent`.** A source with
zero receipts whose effects are absent or unverifiable is simply not migrated yet — the
healthy state of every disabled extension's schema on a fresh install. Previously it
classified Divergent, making `migrate:verify` exit non-zero on perfectly healthy installs
and breaking the documented `migrate:run && migrate:verify` upgrade chain for hosts
shipping disabled engines. Low risk: classification-only.
::

### Key Highlights

::card
#title
`AdoptionState::Pending`
#description
`migrate:verify` now reports untouched sources as `pending` and still exits non-zero only
on genuine divergence — a partially receipted source whose remaining effects are absent or
unverifiable. The lost-ledger adoption path is unchanged: zero receipts with effects
present (the verifier passes every missing basename) stays `adoptable`.
::

### Migration Notes

- **No action required.** If your monitoring keyed on `migrate:verify` output, disabled
  engines now read `pending` instead of `divergent`.

```bash
composer update glueful/framework
```

---

## v1.80.1 - Almach
**Released: August 18, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: the protected migration lane can record its own operation on PostgreSQL.**
`extension_operations.operation` was created as `string(16)`, but 1.80.0's
`migrateProtected()` writes `protected_migrate` (17 chars) — a hard 22001 truncation error
on PostgreSQL that SQLite-based tests never saw. The column is now 32 wide, with a width
tripwire test pinning every operation and status value against the declared DDL.
::

### Migration Notes

- **A database provisioned on exactly 1.80.0** reports the create migration Divergent (its
  checksum changed) — re-provision, or widen the column and update the recorded checksum by
  hand.

```bash
composer update glueful/framework
```

---

## v1.80.0 - Almach
**Released: August 18, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-shield-check"}
#description
**Minor: schema custody closure — provision, protected providers, and host-enforced
manifests complete the schema-on-enable program.** Installer provision now applies the app
path and every manifest core descriptor in one locked custody sequence; protected providers
get their own migration lane on the shared executor; and hosts can opt into refusing
undeclared package schema. Breaking for any host still leaning on 1.79's legacy seams
(none are known to exist): manifest declaration is unconditional, and the beta-era
legacy-alias receipt machinery (including `migrate:normalize-receipts`) is gone — no
supported installs carry pre-manifest ledgers.
::

### Key Highlights

::card
#title
Provision is a complete locked pass
#description
With a context, the installer builds its migration manager through
`MigrationManagerFactory`, so install applies the app path AND every manifest core
descriptor under one custody sequence — global-source snapshot, all-source lock, fresh
pending read inside the lock, run-report-driven outcome. A failed migration is a FAILED
install step naming the basename and error (with manual-repair wording when the driver
could not roll back atomically), never a quiet success; later files stay pending.
::

::card
#title
A migration lane for protected providers
#description
`ExtensionSchemaExecutor::migrateProtected($package, $actor)` serves providers whose
activation is owned elsewhere (`ProtectedProviders` — e.g. a tenancy control plane's
enablement state machine). Same custody as `enable()` — bootstrap asserted, core plus
package sources locked and migrated in order, readiness verified, outcome recorded as a
`protected_migrate` operation — but it refuses non-protected packages, never writes
extension state, and never recompiles the provider cache: those belong to the owning flow.
::

::card
#title
Manifest declaration is unconditional
#description
A provider owned by an installed Glueful package that declares no
`extra.glueful.migrations` manifest can no longer register migration paths at all —
`loadMigrationsFrom()` throws `UndeclaredSchemaException` instead of falling back to the
1.79 append. Every installed Glueful package must declare descriptors or
`"migrations": "none"`. Ownerless app-local providers keep their append lane — that lane
is permanent.
::

### Migration Notes

- **Declare every installed Glueful package's schema** (descriptors or
  `"migrations": "none"`) before upgrading — an undeclared package's provider now throws at
  migration-path registration. First-party packages all declare as of this release.
- **If you used beta-era pre-manifest ledgers:** `migrate:normalize-receipts` and the
  `legacyAliases` descriptor field are removed. Re-provision, or rewrite ledger `source`
  values by hand before upgrading.

```bash
composer update glueful/framework
```

---

## v1.79.1 - Alkaid
**Released: August 18, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: tolerant index drops no longer poison the per-migration transaction.**
`SchemaBuilder::dropIndex()` has always swallowed a failed drop, but under v1.79.0's
per-migration transaction the errored statement aborted the whole transaction on
PostgreSQL (25P02) and failed every later statement — surfaced by fresh-chain migrations
that defensively drop-then-recreate an index. `dropIndex` now emits `DROP INDEX IF EXISTS`
on PostgreSQL and SQLite, so a missing index is a no-op instead of a transaction abort.
Schema-internal; no API, env, or config changes.
::

### Migration Notes

- `composer update glueful/framework` — nothing else.

```bash
composer update glueful/framework
```

---

## v1.79.0 - Alkaid
**Released: August 17, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-database-cog"}
#description
**Minor: schema-on-enable — extension enablement becomes a migrate-first, lock-serialized
operation with a truthful record.** Manifest migration descriptors
(`extra.glueful.migrations`) are now the sole schema inventory, and
`extensions:enable`/`disable` (CLI and HTTP alike) drive one bootstrap-ordered executor:
dependency dry-resolve, source-scoped locks, migrations first, checksum-verified readiness,
enabled state written last, terminal state persisted in a core-owned `extension_operations`
ledger. Moderate risk with **one required upgrade step**: run `php glueful migrate:run`
once after updating, before any extension enable — the executor refuses until the new core
operation ledger exists. Undeclared legacy packages keep booting and migrating globally,
but the new enable/readiness/adoption operations fail closed on them.
::

### Key Highlights

::card
#title
Manifest migration descriptors as the single schema inventory
#description
Every Glueful package declares its migrations in `extra.glueful.migrations` — stable id,
relative path, closed priority enum (including the new `platform` (-50) tier), mode
`core|on_enable`, legacy source aliases, optional structural-verifier FQCN — or the
explicit string `"none"`. `DescriptorInventory` validates the global set with framework
built-ins included: duplicate sources, contested aliases, ancestor/descendant paths, and
malformed declarations all fail closed. `loadMigrationsFrom()` now validates a declared
package's call against its manifest instead of appending; only undeclared/app-local
providers keep the legacy append.
::

::card
#title
The enable executor and the operation ledger
#description
`ExtensionSchemaExecutor` owns enable/disable end to end under bootstrap-safe migration
locks (PostgreSQL advisory locks, MySQL named locks, flock for SQLite — sorted
acquisition, partial-custody rollback, no TTL). Migrations run first, readiness is
re-verified, and the enabled state is written LAST; terminal states
(`succeeded | failed | manual_repair | enabled_cache_stale`) persist in
`extension_operations` with the failing migration. The `APP_ENV=production`
enable/disable refusals are removed — authority, locking, and audit are the safety
boundary. Core leaves (`auth`, `extensions`, `locks`, `metrics`, `notifications`,
`queue`, `scheduler`, `uploads`) now provision unconditionally.
::

::card
#title
Checksum-driven readiness, receipt normalization, and verifier-gated adoption
#description
`SchemaReadiness` classifies each descriptor ready/pending/divergent from ledger receipts
and exact SHA-256s — never `hasTable` probes; a missing ledger means pending with zero
DDL. `migrate:normalize-receipts` rewrites legacy-alias receipts to descriptor identity
(checksum-verified, ambiguity refused). `migrate:verify --adopt <source>` adopts
pre-existing schema only when the manifest-declared structural verifier passes every
missing basename, re-verifies under the lock, and writes all receipts atomically —
nothing is ever dropped. On transactional-DDL drivers each migration's DDL and receipt
now commit or roll back together.
::

### Migration Notes

- **Required, once, before any extension enable:** run the core migration that creates the
  operation ledger — the executor refuses with `SchemaNotBootstrappedException` until it
  exists.
- **Package authors:** declare `extra.glueful.migrations` (or `"none"`) in your manifest;
  `extensions:enable` now refuses undeclared packages with the manifest remedy. Undeclared
  packages still boot and migrate via legacy global `migrate:run`.
- **Global runs are policy-scoped:** `migrate:run` skips disabled `on_enable` descriptors
  and validates explicit file arguments against scope before any DDL.

```bash
composer update glueful/framework
php glueful migrate:run
```

---

## v1.78.4 - Alioth
**Released: August 17, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-database-off"}
#description
**Patch: the lazy-ledger contract completes v1.78.3.** That release deferred database work
in the three migrate *commands*, but every extension provider still constructed
`MigrationManager` at boot via `loadMigrationsFrom()` — and its constructor connected and
ran version-table DDL, creating the `migrations` table as whatever role `.env` named. The
manager now resolves its connection on first database operation: only `migrate()` creates
the ledger, status and pending reads treat a missing ledger as zero applied migrations, and
`rollback()` reports nothing-to-rollback. Migration discovery and registration perform zero
database work, and read-only operational commands work with read-only credentials.
Migration-internal; no API, env, or config changes.
::

### Migration Notes

- `composer update glueful/framework` — nothing else.

```bash
composer update glueful/framework
```

---

## v1.78.3 - Alioth
**Released: August 16, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-terminal-2"}
#description
**Patch: the console works before the database does.** `migrate:run`/`rollback`/`status`
resolved their migration manager — which connects and runs version-table DDL — at console
*registration*, so every `glueful` command required a reachable database just to list
commands: exactly the state a first-run provisioning flow exists to repair. Resolution now
happens on first use, pinned by a refusing-container regression test. Console-internal;
no API, env, or config changes.
::

### Migration Notes

- `composer update glueful/framework` — nothing else.

```bash
composer update glueful/framework
```

---

## v1.78.2 - Alioth
**Released: August 15, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-broom"}
#description
**Patch: the Rector experiment concludes — value harvested, tool retired.** Every parent-class method override in the framework now carries `#[\Override]`, so signature drift against a parent fails at parse time, and the long-dead `setAccessible(true)` reflection calls (no-ops since PHP 8.1) are removed. Rector itself — the dev dependency, its config, and the composer scripts — is retired: its dry-run surface held zero bugs on an already-modern PHP 8.3 codebase whose correctness is enforced by PHPStan level 8 with no baseline and a 2,100+ test suite. Internal-only: no API, env, config, or behavioral changes for applications. Low risk.
::

### Migration Notes

- Nothing to do: `composer update glueful/framework` picks up the patch; no application-facing changes.
- Framework contributors: `composer rector`/`rector:fix` no longer exist. For future PHP-version or PHPUnit major migrations, install Rector ad hoc — that episodic use is its sweet spot.

```bash
composer update glueful/framework
```

---

## v1.78.1 - Alioth
**Released: August 14, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug-off"}
#description
**Patch: API documentation now generates with the route cache in place.** A leftover `storage/cache/routes_dev.php` made `generate:openapi` abort with `Route name '…' already exists` — the generator's cache-detected reset replayed every route registration onto a router whose named-route registry boot had already populated. The reset is gone; generation relies on the manifest's idempotent load, and a cache-populated run now produces a byte-identical document to a cache-free one. Low risk: generation-only, runtime routing untouched.
::

### Migration Notes

- `composer update glueful/framework` — no config or code changes; the old "delete the route cache before generating" workaround is no longer needed.

```bash
composer update glueful/framework
```

---

## v1.78.0 - Alioth
**Released: August 12, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-eye-off"}
#description
**Credentials in URL paths stop reaching the logs.** Redaction has always been keyed on parameter *names* — query strings and body fields — but a secret carried in the path itself (signed payment links, magic links, one-time download URLs) was logged verbatim by the request logger at info level and by the exception handler at error level in every profile. Applications can now register credential-bearing route templates and have the secret segment masked in every framework log sink. Moderate risk: one new config key (`logging.sensitive_paths`) and env var (`LOG_SENSITIVE_PATHS`); with the default empty list, every path is logged byte-identically to 1.77.0.
::

### Key Highlights

::card
#title
Configurable sensitive path redaction
#description
`SensitiveParamRedactor::configureSensitivePaths()` + `sanitizePath()` mask credential segments per registered route template — `'sensitive_paths' => ['/checkout/pay/{token}']` in `config/logging.php` (or `LOG_SENSITIVE_PATHS` as a comma list). `{name}` segments become `[REDACTED]`, `*` matches-and-keeps any single segment, trailing segments are preserved. Matching mirrors `Router::match()`'s own normalization — percent-decoding, repeated-slash collapse, `%2F` as a segment boundary — so every spelling that reaches a live route is redacted, while a `%2F` *inside* a credential cannot split the secret and half-redact it. Templates are written without the deployment's base URL; `Request::getBaseUrl()` is stripped before matching so one template covers root- and base-URL-mounted apps.
::

::card
#title
Every framework path sink swept
#description
Beyond the two primary leaks (`Application::handle()`'s request log, `Handler::report()`'s error log), all remaining request-path log sinks now route through the redactor: the request/response logging middleware's raw `path` field, `CSRFMiddleware` (including its `SecurityException` details), `AuthMiddleware`, `SecurityHeadersMiddleware`, `AdminPermissionMiddleware`, `VersionManager`, `FieldSelectionMiddleware`, `TracingMiddleware` span attributes, and `MetricsMiddleware`'s *persisted* `endpoint`. `sanitizeUrl()` also no longer mis-parses a schemeless `//…` request URI (its first segment was read as a host, carrying the path past redaction). Rate-limit bucket keys stay raw by design — they are hashed, not logged.
::

### Migration Notes

- **No action required** for apps without credential-bearing paths: the default pattern list is empty and log output is byte-identical.
- **Apps issuing tokened URLs:** register the templates — `'sensitive_paths' => ['/checkout/pay/{token}']` — without any base-URL prefix.
- **Redaction covers framework log sinks only:** reverse-proxy, web-server and CDN access logs still record the raw request line and remain the operator's responsibility.
- **Exception *messages* that interpolate a URI are still logged verbatim** — put the URI in the exception context (redacted), not the message (see `docs/SECURITY_NOTES.md`).

```bash
composer update glueful/framework
```

---

## v1.76.0 - Algol
**Released: August 8, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-database-heart"}
#description
**The complete database-layer roadmap in one release — the native alternative to Doctrine DBAL.** Database failures are now typed (`\PDOException`-rooted hierarchy, so every existing catch keeps working), retries run on one honest, configurable budget shared between deadlocks and connection losses, SQLite alterations are fail-closed (six paths that silently did nothing now really execute via audited atomic rebuilds, or throw before mutation), and connections recover — provably-uncommitted transactions replay after reconnection, while commit-ambiguous losses are never replayed. Moderate risk: new env keys, three interface additions for external implementors, and SQLite migrations that previously "passed" by doing nothing now take effect or fail loudly.
::

### Key Highlights

::card
#title
Typed database exceptions
#description
`Glueful\Database\Exceptions`: `UniqueConstraintViolationException`, `ForeignKeyConstraintViolationException`, `NotNullConstraintViolationException` (under a `ConstraintViolationException` parent), `DeadlockException`, `SerializationFailureException`, `LockContentionException`, `ConnectionLostException` — classified from SQLSTATE plus vendor codes (vendor-first, because MySQL reports deadlocks under SQLSTATE 40001) with full state preservation and `sqlState()`/`driverCode()`/`driver()` accessors. `TransactionManager` recognizes retryable failures by marker interface instead of a mixed code list — PostgreSQL `40P01` deadlocks finally retry. Unique violations render HTTP 409 with a fixed, leak-proof message.
::

::card
#title
SQLite alterations are fail-closed
#description
Modify column, drop column, add/drop foreign key, rename column, and inline-unique drops previously generated comment SQL that executed as successful no-ops. They now run through an audited, atomic create-copy-swap rebuild: a preservation audit fails closed before any DDL (generated columns, COLLATE, composite FKs, indexes/triggers/views touching changed columns, `journal_mode=OFF`), global `foreign_key_check` runs before mutation and before commit, rowids and the `sqlite_sequence` high-water mark survive, and the rebuilt table is re-introspected and canonically verified against the planned target. Anything unsupported throws `UnsupportedSchemaOperationException` before mutation.
::

::card
#title
Reconnect resilience
#description
One shared retry budget (`DB_RETRY_MAX_ATTEMPTS` / `DB_RETRY_BACKOFF_MS`, default 3 attempts with 500 ms linear backoff — distinct from the pool's acquisition retries) spans deadlock retries and connection-loss replays. Outermost `Connection::transaction()` calls reconnect and replay work the framework can prove uncommitted; `Connection::idempotentRead()` re-runs caller-declared idempotent reads; `Connection::reconnect()` re-establishes outside transactions. A loss while COMMIT is in flight is never replayed — it surfaces as the non-retryable `CommitOutcomeUnknownException` with the connection invalidated for lazy reconnection.
::

### Migration Notes

- **Applications:** `composer update glueful/framework`; optionally tune `DB_RETRY_MAX_ATTEMPTS`/`DB_RETRY_BACKOFF_MS`.
- **Audit SQLite-targeting migrations** that modify/drop columns or foreign keys: their intent now actually applies (or fails loudly) instead of silently passing.
- **External implementors of framework interfaces:** `TransactionManagerInterface::transaction()` gained an optional `?RetryBudget` param; `SchemaBuilderInterface` gained `executeSqliteRebuild()` and `executeSqliteNativeAlteration()`; `TableBuilderInterface` gained `rename()`.
- **`Connection::transaction()` retry tuning moved to config** — `setMaxRetries()` still governs direct `TransactionManager` use only.
- Replay callbacks must build query chains inside the callback from the supplied connection; prebuilt builders retain the stale PDO.
- Code that retried on commit-phase `ConnectionLostException` was risking duplicate commits — it now sees `CommitOutcomeUnknownException` (still a `PDOException` subclass); audit any such handler.

```bash
composer update glueful/framework
```

---

## v1.75.0 - Algieba
**Released: August 7, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-shield-check"}
#description
**The whole framework now type-checks at PHPStan level 8 with zero suppressed errors.** A 31-area campaign cleaned 914 errors of typing debt, raised the CI gate from level 6 to level 8 over `src/` and `config/`, upgraded the engine to PHPStan 2.x, and finished by fixing all 111 baseline entries and deleting the baseline file. Along the way the sweep surfaced and fixed genuinely latent bugs — a reachable `orHas()` fatal, auth request attributes that were always `null`, an unreachable soft-delete branch. Moderate risk: the diff surface is wide, but every area landed behind the full test suite and the few contract-visible changes are listed in the migration notes.
::

### Key Highlights

::card
#title
Level 8 everywhere, with no baseline
#description
All 31 areas of `src/` were cleaned area-by-area — each behind the full test suite — and the gate in `phpstan.neon` was raised from level 6 to `level: 8`. The frozen PHPStan-2 upgrade baseline was then burned down entirely and deleted, so the gate runs with zero suppressed errors. New findings are fixed at the source; the one permanent, documented ignore is `trait.unused`, because the framework ships traits as public API for applications and extensions.
::

::card
#title
The sweep fixed real bugs, not just annotations
#description
`orHas()` / `orDoesntHave()` / `orWhereHas()` / `orWhereDoesntHave()` crashed with an undefined-method fatal — `QueryBuilder::orWhereRaw()` now exists and is public API. The post-auth request attributes `email` and `username` were always `null` (the middleware read private properties instead of accessors). Soft-delete restore/delete on joined queries never qualified the `deleted_at` column — an unreachable branch since day one, now served by the new `QueryBuilder::hasJoins()`. Also fixed: `QueryCacheService`'s default key prefix never applied, failed-job retry name mangling, JWT and webhook signing of `"false"` payloads, and `RedisCacheDriver::zadd()` erroring on an empty map.
::

::card
#title
Honest contracts and hardened edges
#description
The ORM relation machinery is typed against `Model` instead of `object`, with `class-string<Model>` relation definitions. `Model::toJson()` / `Collection::toJson()` throw named errors instead of returning `false` typed as `string`, as does `FileUploader::calculateChecksum()` on an unreadable file. `WhereClauseInterface` now declares `orWhereRaw()`. Dozens of `preg_match` conditions were pinned with the correct operator, and false-returning calls (`glob`, `file_get_contents`, `json_encode`, `preg_replace`) are guarded throughout — fail-closed where the value feeds redaction, hashing, or signing.
::

::card
#title
PHPStan 2.x engine and advisory Rector
#description
Static analysis runs on PHPStan 2.2 with the phpunit, strict-rules, and deprecation-rules extensions on their 2.x majors, using identifier-tagged errors. Rector joins as dev-only tooling with a conservative wave-0 config (PHP 8.3 + PHPUnit sets; readonly-class rectors permanently skipped as BC hazards) — `composer rector` dry-runs it on demand; it does not run in CI.
::

### Migration Notes

- **Applications:** `composer update glueful/framework` is enough — no new env vars, config keys, migrations, or default changes.
- **If you implement `WhereClauseInterface`** (rare): add the `orWhereRaw()` method.
- **If you subclass ORM relation classes:** parents/related instances are typed `Model`, not `object`.
- **If you catch around `toJson()`:** unencodable payloads now throw a named error instead of returning `false`.
- Installs with an empty query-cache `keyPrefix` get the intended default prefix — the query cache re-keys once after upgrade (one round of cache misses, not an error).
- **Contributors / CI forks:** the analysis gate is now level 8 with no baseline file.

```bash
composer update glueful/framework
```

---

## v1.74.1 - Algenib
**Released: July 30, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-refresh-alert"}
#description
**Session enumeration no longer recurses into itself.** Listing, counting, or bulk-managing a user's sessions through the container-resolved session store triggered an unbounded mutual recursion between `SessionStore::listByUser()` and the cache manager's `findUserSessions()` — each deferred to the other with no base case — and exhausted memory. The common login, logout, and refresh flows operate on a single session by token and were never affected, which is why it stayed latent. A pure bugfix, low risk.
::

### Key Highlights

::card
#title
Cache-index enumeration is the manager's sole authority
#description
`SessionCacheManager::findUserSessions()` no longer delegates back to `SessionStore::listByUser()`; it reads the cache user-index directly, which was always its source of truth. That breaks the cycle for every enumeration path — `getUserSessions`, `getUserSessionCount`, `terminateAllUserSessions`, `refreshPermissionsForAllUserSessions`, and `SessionStore::listByUser`. `revokeAllForUser()` was already a direct database operation and is untouched. Making database enumeration authoritative — which means mapping rows to the token-bearing payload shape those callers depend on — is a deliberate later redesign, kept out of this fix on purpose.
::

### Migration Notes

- Nothing to do: a pure bugfix with no API, config, or schema change. Any feature that lists or bulk-manages a user's sessions simply stops exhausting memory.

```bash
composer update glueful/framework
```

---

## v1.74.0 - Algenib
**Released: July 30, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-user-check"}
#description
**Username validation now matches the column, not a product rule.** `UsernameDTO` and `UserDTO` accepted 3–30 characters, which quietly ruled out a whole category of application: one that uses a normalized email address as the username. Plenty of valid addresses exceed 30 characters. The framework now enforces only storage-safe invariants — required, trimmed, at least 3 characters, within the `varchar(255)` column, unique — and leaves narrower policies to the applications that actually know what their usernames are for. Strictly more permissive, no schema change, nothing previously valid becomes invalid.
::

### Key Highlights

::card
#title
Storage-safe invariants in the framework, product rules in the app
#description
Both validators now bound usernames by a shared `MAX_LENGTH` constant set to 255 — the width of the `users.username` column — rather than an arbitrary 30. The distinction is deliberate: the framework can enforce what the database requires, but it cannot know whether a host wants slug-safe handles, reserved-name checks, a shorter display limit, or an email. Applications impose those at their own input boundary. It is not unbounded either; accepting more than the column holds would only move the rejection from validation to the database, where the error is worse.
::

### Migration Notes

- Strictly more permissive: every username that validated before still validates. No migration — the column has always been `varchar(255)`.
- If your application relied on the framework rejecting usernames longer than 30 characters, add that rule at your own input boundary; it is no longer enforced centrally.

```bash
composer update glueful/framework
```

---

## v1.73.0 - Algedi
**Released: July 29, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-cookie"}
#description
**Browsers get a first-class transport, and CSRF finally binds to the session.** An opt-in HttpOnly cookie session now sits alongside the unchanged bearer path: one middleware adapts a cookie into the header `auth` already reads, one issuer owns every cookie attribute, and one login orchestrator means no transport can reach session issuance around the two-factor gate. Shipping alongside it is a security fix the transport depends on — CSRF tokens were binding to an IP + User-Agent fingerprint for every authenticated request, not to the session. The transport is off by default and bearer behavior is byte-identical, but the CSRF fix invalidates tokens held by authenticated callers at upgrade time. Read the migration notes before upgrading.
::

### Key Highlights

::card
#title
Opt-in HttpOnly session cookies, without touching bearer auth
#description
The new `session_cookie` middleware reads an HttpOnly access cookie, injects the `Authorization` header that `AuthMiddleware` already understands, and records `auth_transport` on the request — so cookie-authenticated writes can be required to carry CSRF protection while API clients stay exempt. `SessionCookieIssuer` is the single place cookie attributes are set (HttpOnly, Secure, `SameSite=Lax`, host-configurable names, refresh cookie path-scoped to `/auth/session`), and it accepts only a completed session, making "issue cookies for a login still awaiting second-factor verification" unrepresentable rather than merely discouraged. Mixed credentials are never silently resolved: a bearer and cookie resolving to the same identity defer to the bearer, a mismatch is rejected. Off by default — while `SESSION_COOKIE_ENABLED=false` the session routes are not registered at all.
::

::card
#title
One login path, one two-factor gate
#description
Password login now runs through `LoginOrchestrator`, which returns a closed `LoginOutcome` — an authenticated session or a pending two-factor challenge, never both and never neither. That closed result is what makes a second transport safe to add: a login awaiting verification has no session to hand out, so nothing downstream can obtain one. Token and API-key credential exchange deliberately stays outside the orchestrator, because those providers return an identity payload with no tokens and are not a session. JSON login responses are byte-identical.
::

::card
#title
Session refresh and logout that never leak tokens
#description
`POST /auth/session/refresh` rotates both cookies using the path-scoped refresh cookie and returns no tokens in the body; the refresh credential is only ever read from the cookie, never a body field. `POST /auth/session/logout` revokes the server-side session and clears both cookies through one composition point, so the guarantee under test is the pair rather than two operations a caller might do only half of — and when revocation fails the cookies are still cleared but the response is a 500, because a live server session after a logout is not a success. Both endpoints are cookie-only and same-origin only, enforced by fetch metadata with an exact-Origin fallback.
::

::card
#title
CSRF tokens bind to the session, not a fingerprint
#description
`getSessionId()` looked only for `user['session_id']` — a key no provider emits, since JWT authentication returns `sid` and `session_uuid` — so every authenticated request fell through to the anonymous fingerprint branch built from IP and User-Agent. Two visitors behind one NAT using the same browser therefore shared a CSRF identity, and a token issued to one would validate a write from the other. Tokens now key on the session uuid, and a new `generateTokenForSession()` lets login response shaping bind the token to the session it just issued, since login runs before any authenticated identity is attached to the request. Unauthenticated forms still fall back to fingerprinting, unchanged.
::

### Migration Notes

- **CSRF tokens issued to authenticated callers before this release stop validating.** There is no compatibility window and no automatic recovery: an affected client receives a `403` and must fetch a new CSRF token or reload the page. Old fingerprint-keyed cache entries expire on their own. Unauthenticated forms are unaffected.
- The browser session transport is opt-in and off by default. No action is required to keep bearer-only behavior; bearer extraction, `POST /auth/login` and its JSON response, `/auth/refresh-token` and `/auth/logout` are all unchanged.
- To enable it, set `SESSION_COOKIE_ENABLED=true` and add `session_cookie` before `auth` on the routes that should accept cookies (`session_cookie:optional` for pages that must survive a lapsed session). See `docs/BROWSER_SESSIONS.md`.

```bash
composer update glueful/framework
```

---

## v1.72.1 - Alderamin
**Released: July 26, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-refresh"}
#description
**Activation writes now recompile the extension cache from what was just written.** Every activation surface runs a read→write→recompile sequence in one process: reading the enabled list primes the context config cache, `ExtensionStateWriter` mutates `config/extensions.php`, and the recompile previously resolved through the stale cache — persisting the PRE-write activation state. A just-enabled provider could be missing from the compiled cache; a just-disabled one could remain. Pure fix — upgrade and run.
::

### Key Highlights

::card
#title
No-arg writeCacheNow() resolves from current file state
#description
`ExtensionManager::writeCacheNow()` with no explicit list now clears the context config cache before resolving, so `extensions:enable`, `extensions:disable`, and the extensions admin toggle recompile from the `config/extensions.php` that was just written instead of the enabled list cached earlier in the same process. Config defaults registered by extensions and boot-time overrides survive the clear (only the file-read layer drops), and explicit-list `writeCacheNow([...])` calls are unchanged. A regression test pins the full read→write→recompile sequence.
::

### Migration Notes

- No new env vars, no migrations, no default changes, no API changes.

```bash
composer update glueful/framework
```

---

## v1.72.0 - Alderamin
**Released: July 26, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-stack-3"}
#description
**Three additive extension seams: one provider order, one provider owner, one activation gatekeeper.** A declarative cross-phase load-order contract shared by container compilation, discovery, cache generation, and cached boot; type-agnostic provider-to-package attribution so app-integrated provider packages keep honest `managed_by`; and a `extensions.protected` guard that makes generic enable/disable refuse providers owned by domain lifecycle flows. Hosts adopting none of the new contracts see byte-identical behavior — upgrade and run.
::

### Key Highlights

::card
#title
One declarative provider order for every phase
#description
Implement the new `DeclaresLoadOrder` interface (static `loadAfter()` / `loadPriority()`, readable from class strings without constructing providers) and the pure `ProviderOrderer` — applied inside `ProviderClassResolver`, the single resolution path — guarantees the same relative order in service-definition compilation, live development discovery, `extensions:cache` and implicit or explicit `writeCacheNow()` cache generation, and cached production boot. Previously these phases could disagree: the boot-time sorter ran only on the uncached development path, so an instance-level `bootAfter()` order seen in development silently differed from production. Cycles — including self-dependencies — now throw `ProviderOrderCycleException` naming every blocked provider, failing cache generation and production boot loudly instead of logging a fallback. The legacy instance-level `OrderedProvider` keeps its exact semantics for third-party boot-only ordering, but can no longer move declarative participants relative to each other — including through its logged cycle fallback, which now re-applies the declarative contract.
::

::card
#title
Provider ownership survives any package type
#description
`PackageManifest::providerOwnership()` maps `extra.glueful.provider` to its owning composer package across ALL installed packages regardless of `type`, with FQCN normalization and a fatal error when two packages claim one provider. Permission catalog `managed_by` attribution now uses it — so a host that ships app-integrated provider packages as ordinary `library`-typed path repositories (keeping them out of the extension catalog on purpose) still gets stable per-package permission attribution instead of everything degrading to `app`.
::

::card
#title
Protected providers refuse generic toggles
#description
A new `extensions.protected` config map (`provider FQCN → {reason, managed_by}`) is consulted by `extensions:enable`, `extensions:disable`, and the extensions admin toggle BEFORE any already-enabled/not-enabled short-circuit or writability check — a protected provider always answers with its ownership story ("Managed by the tenancy enablement flow — use the workspaces admin") as a CLI failure or HTTP 409, and never a misleading state message. Built for providers owned by domain lifecycle state machines (glueful/tenancy's enablement flow is the canonical case) and for create-project templates that ship bundled-required extensions. `ExtensionStateWriter` stays policy-free, so owning flows keep using it directly.
::

### Migration Notes

- No action needed: the new config key defaults to `[]` and all three seams are inert until adopted. If you ship a lifecycle-managed extension (e.g. glueful/tenancy runtime enablement), declare it in `extensions.protected` so generic toggles can no longer corrupt its state machine.

```bash
composer update glueful/framework
```

---

## v1.71.3 - Alcor
**Released: July 25, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-terminal-2"}
#description
**Console fix: extension-discovered commands no longer run in a parallel, never-booted world.** Commands discovered from extensions (rather than registered as container services) were instantiated bare, which sent `BaseCommand` down its no-args path — a fresh `ApplicationContext` plus a fresh container in which extension `boot()` never ran. Those commands silently operated without capabilities, boot-registered contributors, or event listeners, so a CLI run could see (and write) different state than the running application. Pure fix — upgrade and run.
::

### Key Highlights

::card
#title
Discovered commands receive the real booted container and context
#description
`Console\Application::registerDeferredExtensionCommands()` falls back to direct instantiation when a discovered command class is not registered in the container. That fallback now passes the console's own container and its `ApplicationContext` to any `BaseCommand` subclass — exactly what container-resolved commands already received — instead of `new $class()` with no arguments. The no-args path built a second world: `BaseCommand` constructed a fresh context from `getcwd()` and a fresh container via `ContainerFactory`, where extension `boot()` had never run. Anything boot-registered — capability registrations, starter/content contributors, event listeners — was invisible to the command, and state written from that world could diverge from what the application maintains. A concrete instance: a host app's sync command could not see an extension's registered contributors and mis-marked their bookkeeping rows as orphaned.
::

### Migration Notes

- No new env vars, no migrations, no default changes, no API changes. If you ship extension commands, they now observe the same booted state as HTTP requests — remove any workarounds that re-registered boot-time state inside command constructors.

```bash
composer update glueful/framework
```

---

## v1.71.2 - Alcor
**Released: July 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-plug-connected"}
#description
**Follow-up fix: non-pooled connection reuse is now scoped to framework-managed connections.** 1.71.1's identity-keyed PDO reuse could collapse an intentionally independent, hand-built `new Connection([...])` into the framework's shared session when their configs resolved identically (typical in CI) — turning session-level semantics (advisory locks, open transactions) into self-interactions and deadlocking race-style code. Reuse now requires the constructor's `ApplicationContext`; context-less constructions always get a fresh backend. The 1.71.1 leak fix is fully preserved. Pure fix — upgrade and run.
::

### Key Highlights

::card
#title
Ad-hoc `new Connection([...])` always gets its own backend again
#description
A caller hand-building a Connection is usually asking for an independent session — a second session that holds a lock or transaction open while another session (or a child process) contends with it. 1.71.1 keyed reuse purely by connection identity (DSN + user + schema), so when an ad-hoc construction's config resolved identically to the managed connection (typical in CI, where DB settings come from real environment variables and every construction path sees the same values), the two silently became one PG session — and a lock held on the "second connection" was a lock the same session's contender could never acquire. Reuse is now gated on the constructor's `$context` parameter: the DI container's `database` factory passes it, so framework-managed connections still share one identity-keyed backend (the "too many clients" leak fix stands); `new Connection([...])` without a context restores 1.71.0 semantics — a fresh, independent backend every time. SQLite is unchanged (never reused).
::

### Migration Notes

- No new env vars, no migrations, no default changes, no API changes. If you construct `Connection` directly and *want* the shared framework backend, pass the `ApplicationContext` as the second constructor argument; without it you get an independent session.

```bash
composer update glueful/framework
```

---

## v1.71.1 - Alcor
**Released: July 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-plug-connected"}
#description
**Two runtime bugfixes: non-pooled connection reuse and OPcache-off route-cache warmup.** Without pooling, `Connection` leaked a database backend per instance — enough short-lived containers exhausted the server's connection ceiling ("too many clients"). And route-cache warmup threw on every boot when OPcache was loaded but disabled. Pure fixes: no new env vars, no migrations, no default changes, no API changes.
::

### Key Highlights

::card
#title
Non-pooled `Connection` no longer leaks a backend per instance
#description
With connection pooling disabled, `new Connection(...)` opened a fresh PDO in its constructor and never reused it, so each additional container (a test harness that boots the framework repeatedly, or any process constructing several `Connection`s) opened another server connection that was only released on GC — which cyclic container graphs and cached contexts prevent. Enough of them exhausted the server's `max_connections` (`FATAL: sorry, too many clients already`) and slowed runs to a crawl. Server engines now reuse a process-global PDO keyed by the **full connection identity** (DSN + user + schema), so equivalent connections share one backend while a connection opened for a *different* schema/host/db/user still gets its own — preserving intentional isolation (e.g. a caller that opens a private-schema connection). **SQLite is excluded** (a `:memory:` database is private to its connection; file databases are cheap), so its pooling-off behavior is byte-unchanged. Pooled mode is untouched.
::

::card
#title
Route-cache warmup no longer throws when OPcache is loaded but disabled
#description
`RouteCache::save()` guarded `opcache_compile_file()` with `function_exists()` alone; when the extension is present but off (e.g. `opcache.enable_cli=0`, the default in CI) the call throws "Zend OPcache has not been properly started, can't compile file". The throw was caught upstream but spammed logs and aborted HTTP-layer warmup on every boot. Warmup now runs only when OPcache reports itself enabled for the current SAPI.
::

### Migration Notes

- No new env vars, no migrations, no default changes, no API changes. Both are internal runtime fixes; upgrade and run.

```bash
composer update glueful/framework
```

---

## v1.71.0 - Alcor
**Released: July 20, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-shield-lock"}
#description
**Outbound-webhook security & reliability seams: strict event dispatch, an SSRF-safe outbound-target resolver, and hardened API-key rotation.** Three additive, application-agnostic building blocks extracted while hardening the commerce marketplace's seller webhooks. No new env vars, no migrations, no default changes. **One behavioral note:** API-key rotation no longer extends a predecessor's expiry (see Migration Notes).
::

### Key Highlights

::card
#title
`EventService::dispatchOrFail()` — strict, at-least-once event dispatch
#description
Alongside the existing fault-isolating `dispatch()` (which logs and continues past a throwing listener), `dispatchOrFail()` stops at the first failing listener, logs, and rethrows the original exception so the caller's transaction can roll back. `dispatch()` is byte-unchanged — a pure insertion guarded by regression tests; the strict path is opt-in per call site, for events whose delivery is a correctness invariant (a financial webhook that must not be silently lost). The PSR `EventDispatcherInterface` alias resolves to the concrete `EventDispatcher`, so the strict path is reachable through the container.
::

::card
#title
`SafeOutboundTargetResolver` — one SSRF-safe URL → validated, IP-pinned target
#description
A single place (`src/Http/Security/`) that turns a URL into a validated outbound target, with two profiles. `resolveSafeFetch()` preserves the exact behavior of the existing `Client::safeRequest*()` SSRF checks — byte-for-byte, so existing callers are unaffected. `resolveWebhook()` applies a stricter third-party-delivery profile: HTTPS only; rejects embedded credentials, fragments, non-default ports, IP-literal hosts, and malformed/ambiguous IDNA; resolves every A/AAAA record and refuses if any resolves into a blocked range (loopback, private, link-local, CGNAT `100.64/10`, and reserved/embedded-v4 IPv6). `Client::safeWebhookRequestAsync()` builds on it: resolve once, pin the checked IP into the request's resolve map (no TOCTOU/DNS-rebinding window), never follow redirects.
::

::card
#title
Hardened `ApiKeyService::rotate()`
#description
Rotation now returns the successor key's `new_uuid` (an additive field — consumers that ignore it are unaffected) and clamps the predecessor's expiry to `min(existing, now + grace)`, so rotation can only ever shorten a superseded key's life, never extend it. The successor's own expiry is captured before the clamp and is unaffected.
::

### Migration Notes

- **API-key rotation no longer extends a predecessor's expiry.** Before 1.71.0, rotating a key with a grace window could push a superseded key's `expires_at` later than its original value; it now takes the earlier of the two. If you relied on rotation to lengthen an old key's lifetime, issue a fresh key instead. Otherwise no action is required — the new `new_uuid` field is purely additive.
- No new env vars, no migrations, no default changes. The event and HTTP additions are opt-in seams; `dispatch()` and the existing `safeRequest*()` SSRF behavior are byte-identical to 1.70.x.

```bash
composer update glueful/framework
```

---

## v1.70.0 - Albireo
**Released: July 16, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-layers-intersect"}
#description
**A blob-policy composition seam plus two long-standing database fixes.** Extensions can now contribute blob access policies simultaneously through `BlobAccessPolicyRegistry`; `whereIn()` works on `update()`/`delete()`; and `createTable()` plain indexes are no longer silently discarded on SQLite/PostgreSQL. Additive API, no new env vars, no migrations. **One operational note** for pre-existing SQLite/PostgreSQL dev databases (see Migration Notes).
::

### Key Highlights

::card
#title
Blob access policy composition — `BlobAccessPolicyRegistry` + `CompositeBlobAccessPolicy`
#description
Applications and extensions register named `BlobAccessPolicy` contributors into a shared `BlobAccessPolicyRegistry` (a normal DI service bound by `StorageProvider` — no static accessor, no process-global fallback). `UploadController` always receives a `CompositeBlobAccessPolicy` wrapping the primary policy (bound `BlobAccessPolicy`, or the `Null` fallback) AND-composed with every registry contributor: veto semantics — any denial denies, short-circuiting in primary-then-insertion order. The composite holds the live registry, not a snapshot, so a contributor registered during a later extension's `boot()` is enforced immediately. With zero contributors, behavior is byte-identical to the previous unwrapped policy.
::

::card
#title
`whereIn()` / `whereNotIn()` on write operations
#description
The UPDATE/DELETE condition reparser only recognized single-placeholder raw conditions, so `whereIn()`'s multi-placeholder `col IN (?, ?, …)` was rejected with "Complex WHERE conditions … not yet supported". The reparser now recovers the column, operator, and bound values — with binding offsets preserved when composed with other predicates. `whereIn(col, [])` on a write still throws, as before.
::

::card
#title
`createTable()` plain indexes on SQLite/PostgreSQL
#description
Inline `->index(...)` definitions in a create-table callback were only emitted by the MySQL generator; on SQLite and PostgreSQL they vanished without error. `TableBuilder::create()` now emits every plain index as a follow-up `CREATE INDEX` statement uniformly across drivers (the same artifact kind `alterTable()` produces — real and droppable), and MySQL stops inlining plain indexes so nothing is created twice.
::

### Migration Notes

- **SQLite/PostgreSQL databases migrated before 1.70.0 are missing every plain index declared inline in a `createTable()` callback** — they were silently discarded. Fresh migrations are correct automatically; for existing databases, re-run the relevant `CREATE INDEX` statements or re-migrate dev databases. Performance-only: data and query results were never affected.
- No other action required — the registry seam is additive, and the `whereIn()` write fix turns a previously throwing call into the behavior its builders already advertised.

```bash
composer update glueful/framework
```

---

Older releases (**v1.69.0 and earlier**) live in the [Release Archive](/releases-archive). For the full machine-readable history see the [CHANGELOG](https://github.com/glueful/framework/blob/main/CHANGELOG.md).
