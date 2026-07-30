---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

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

## v1.69.0 - Albali
**Released: July 14, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-adjustments"}
#description
**A boot-time config override seam: `ApplicationContext::overrideConfig()`, frozen once boot completes.** One additive method that lets applications and extensions override configuration during boot. No new env vars, no migrations, no default changes; unbound behavior is byte-for-byte identical to 1.68.x. **No action required.**
::

### Key Highlights

::card
#title
Process-local config overrides — `ApplicationContext::overrideConfig()`
#description
`overrideConfig(string $key, mixed $value)` applies a config override that wins over file/env/default config (precedence: extension defaults < file/env < override). Overrides take dot-path keys, deep-merge into nested config, and survive `clearConfigCache()` (which only clears the loaded/cached layers). The window is **boot-only**: `Framework::boot()` calls `ApplicationContext::markBooted()` once every boot phase — including extension/provider boot — has run, after which `overrideConfig()` throws. Mid-request config mutation would otherwise create split-brain services that read config at different times. Built for (and consumed by) the Thallo tenancy public-origin surface, which persists a base domain + default hosts and applies them over config at boot; the seam itself is application-agnostic.
::

### Migration Notes

- No action required — the method is purely additive and nothing in the framework calls it. Existing apps behave identically.
- To adopt it, call `ApplicationContext::overrideConfig()` from a service provider's `register()` (or any boot-phase code), before boot completes.

```bash
composer update glueful/framework
```

---

## v1.68.0 - Ain
**Released: July 10, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-plug"}
#description
**Blob route extensibility: two generic, unbound-by-default seams over the blob endpoints, a reusable `auth:optional` mode, and a signed-URL fix for private uploads.** No new env vars, no migrations, no default changes. The blob VIEW route's auth posture changes — but the controller remains the authoritative gate, so response shapes are identical. **No action required.**
::

### Key Highlights

::card
#title
Per-action blob middleware — `BlobRouteMiddlewareProvider`
#description
Applications can contribute middleware to the framework's blob endpoints without replacing them. The provider is soft-resolved at route registration (extension providers boot before framework routes load, so this is race-free) and asked once per `BlobRouteAction` (`upload`, `view`, `info`, `delete`, `sign`); contributed aliases are inserted after authentication and before rate limiting. Unbound, the routes are byte-for-byte unchanged — the framework binds nothing and never inspects what contributed middleware does.
::

::card
#title
Application-chosen blob origins — `BlobPublicUrlProvider`
#description
Signed and public blob URLs previously always used the request host — wrong whenever URLs are generated from one host (say, a central admin API) but served from another. The provider lets the application supply the base origin per blob; returning `null` keeps the request host. Because URL signatures cover path + query only, overriding the host never invalidates a grant.
::

::card
#title
Optional route authentication — `auth:optional`
#description
A general `AuthMiddleware` mode: authenticate when credentials are supplied, pass anonymous requests through untouched, and still reject malformed or invalid credentials. Built for routes whose authoritative access decision lives in the controller (like blob VIEW's visibility/signature checks) but useful anywhere authenticated-if-present semantics are wanted.
::

::card
#title
Fixed: signed URLs under globally private uploads
#description
With `uploads.access=private`, the blob VIEW route carried route-level `auth` — so an anonymous request presenting a **valid signed URL** was rejected with 401 before the controller could ever validate the signature. VIEW now uses `auth:optional` plus the controller's authoritative visibility/auth/signature checks: anonymous signed access works, authenticated direct reads keep working, unsigned anonymous private access still gets its 401 (re-derived controller-side), and all private access aliases (`private`, `true`, `'true'`, `1`) share one retrieval rule.
::

### Migration Notes

- No action required. Both seams are unbound pass-throughs; the VIEW behavior change only *adds* a previously-broken capability (anonymous signed access in private mode) while preserving all existing responses.
- To adopt the seams, bind `BlobRouteMiddlewareProvider` and/or `BlobPublicUrlProvider` in a service provider — the blob route registration and `signedUrl()` soft-resolve them.

```bash
composer update glueful/framework
```

---

## v1.67.0 - Adhil
**Released: July 10, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-plug"}
#description
**Four opt-in extension seams — independent DB sessions, around-execution wrappers, write-side row hooks, and blob lifecycle/authorization hooks.** Every seam is an exact pass-through until your application binds it: no new env vars, no migrations, no default changes, and unbound behavior is byte-for-byte identical to 1.66.x. **No action required** — upgrade and adopt seams as needed.
::

### Key Highlights

::card
#title
Independent database sessions — `Connection::newPdo()`
#description
Opens a fresh, **non-pooled** PDO from the connection's resolved configuration, fully independent of the shared statement session. Built for session-scoped infrastructure like PostgreSQL advisory locks, where a failed application transaction on the shared PDO must not be able to poison or leak the lock session. Sessions minted here are not pool-managed — they live until released or garbage-collected, which is exactly the property a dedicated lock session needs.
::

::card
#title
Around-execution wrappers — `QueryExecutor::addExecutionWrapper()`
#description
The existing query-interceptor seam is before-only: it returns before the statement executes, so nothing registered there can hold a resource *across* execution. `ExecutionWrapperInterface::around(string $sql, array $bindings, callable $proceed): PDOStatement` composes around the actual prepare/execute, so an extension can acquire a lock, call `$proceed()`, and release in `finally` — spanning the full statement boundary. The registry is process-level and resettable via `clearExecutionWrappers()`.
::

::card
#title
Write-side row hooks — `Connection::addInsertHook()`
#description
The write-side counterpart to the existing `table()` read hooks. A registered `fn(string $table, array $data): array` runs over the row of every `QueryBuilder` `insert()`, `insertBatch()`, and `upsert()`, letting one extension stamp or transform columns (a tenant key, `created_by`, an encrypted field) in one place instead of every repository. Batch inserts are hardened around hook output: non-uniform column sets and list-shaped rows are rejected before SQL generation, and key order is normalized so a reordered-but-equal column set cannot misalign positional binding.
::

::card
#title
Blob lifecycle + authorization hooks
#description
`BlobCreatedHook::onBlobCreated()` runs after a blob row is persisted; **throwing rejects the upload**, and the controller compensates deterministically — checked storage-object delete, hard row delete via the new `BlobRepository::forceDelete()`, and a verified `status='deleted'` quarantine fallback, so a rejected upload can never leave a servable blob. `BlobAccessPolicy::authorizeAccess()` runs after the framework's own visibility/auth/signature checks on `show`/`info`/`delete`/`signedUrl`, receiving a `BlobAccessContext {action, authenticatedUserUuid, signatureValid}`; returning `false` yields a 404. Thumbnail generation now defers until the hook accepts (`FileUploader::generateThumbnailFor()`), so a rejected upload never leaves an orphaned public thumbnail — and a thumbnail failure after acceptance degrades to `thumb_url: null` instead of failing a committed upload. Both hooks resolve softly from the container with null-object defaults; the framework binds neither.
::

### Migration Notes

- No action required. All four seams are unbound by default and exact pass-throughs; existing applications behave identically.
- To adopt a seam, bind your implementation in a service provider (e.g. bind `BlobCreatedHook`/`BlobAccessPolicy` to your classes) — the framework's `UploadController` factory soft-resolves them.
- `BlobRepository::forceDelete()` permanently removes a blob row (bypasses soft-delete). Reach for it only in compensation paths; normal deletion remains the soft `status='deleted'` flow.

```bash
composer update glueful/framework
```

---

## v1.66.3 - Adhara
**Released: July 6, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug"}
#description
**Route caching no longer crashes routes whose `where()` constraint contains parentheses.** After 1.66.2 re-enabled route caching for apps that mount an SPA, any dynamic route with a parenthesized constraint — e.g. a non-capturing `(?:twig|css|js)` group — raised `ValueError: array_combine(): … must have the same number of elements` on its first request. The compiled cache now stores each route's original path and constraints and rebuilds from them, instead of reverse-engineering the path from the regex. **No action required** — the cache format is bumped, so stale route caches regenerate automatically on upgrade.
::

### Key Highlights

::card
#title
Lossless dynamic-route reconstruction from the compiled cache
#description
When the router serves its table from the compiled cache, it rebuilds each dynamic `Route` from cached metadata. It previously reverse-engineered the route path from the compiled regex via `Router::patternToPath()`, whose group-matching regex mistook a constraint's inner non-capturing `(?:…)` group for the parameter's own capture group. The rebuilt route then compiled to a pattern with more capture groups than parameter names, so `Route::match()` called `array_combine()` with mismatched key/value counts and threw a `ValueError` on the first request to match it. The `RouteCompiler` now serializes each dynamic route's **authoritative original path and `where` constraints**, and `Router::reconstructDynamicRoutes()` rebuilds from those and recompiles the pattern identically to registration — so a cached route matches exactly like a freshly-registered one. The `RouteCache` format version is bumped, so any route cache written by an earlier build is invalidated and regenerated on upgrade.
::

### Migration Notes

- No action required. The fix is transparent; the bumped cache-format version invalidates any pre-existing route cache so it rebuilds on the next boot. Running `php glueful route:cache:clear` (or `cache:clear`) forces it immediately.

```bash
composer update glueful/framework
php glueful route:cache:clear
```

## v1.66.2 - Adhara
**Released: July 6, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bolt"}
#description
**Mounting an admin/SPA no longer disables route caching.** `serveFrontend()` registered the SPA mount root and `/{rest}` catch-all as closures, and `RouteCache` refuses to cache a route table containing any closure — so every SPA-mounting app ran uncached and logged a `[RouteCache] Skipping cache … Convert to [Controller::class, "method"] syntax` warning on each boot. The seam now uses controller handlers backed by a mount registry; asset/index serving is byte-for-byte identical. **No signature or config change, no new env vars** — affected apps regain route caching automatically after upgrading.
::

### Key Highlights

::card
#title
Route caching restored for SPA-mounting apps
#description
`ServiceProvider::serveFrontend()` mounted a compiled admin/SPA bundle by registering two routes — the mount root and a `/{rest}` catch-all — as **closures** that captured the bundle directory and asset-serving helpers. `RouteCache` cannot serialize closures, so on encountering one it rejects the **entire** compiled route table, disables route caching for the whole application, and logs `[RouteCache] Skipping cache: N route(s) use closure handlers`. The seam now registers controller handlers — `[SpaMountController::class, 'root'|'asset']` — backed by a new `FrontendMountRegistry` that resolves the owning mount from the request path by longest-prefix match, so one mount-agnostic controller serves any number of mounts (`/admin`, `/portal`, …). The asset/index behaviour is unchanged to the byte: mime typing, static-asset security headers, the immutable-vs-revalidate cache split, ETag/`304`, path-traversal + dotfile + `.php` denial, and the SPA deep-link fallback. New public classes `Glueful\Routing\FrontendMountRegistry` and `Glueful\Routing\SpaMountController` are registered as shared services in `CoreProvider`.
::

### Migration Notes

- No action required. The `serveFrontend()` signature and behaviour are unchanged; there are no new env vars and no config changes. After upgrading, apps that mount an SPA will build the route cache normally and the `[RouteCache]` boot warning disappears.

```bash
composer update glueful/framework
php glueful cache:clear
```

## v1.66.1 - Adhara
**Released: July 6, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-package"}
#description
**The extension installer is now synchronous.** The 1.66.0 installer spawned `composer require` as a detached background job and made the client poll — but forking a long-lived PHP CLI from a web server (Apache/php-cgi/nginx+FPM) proved unreliable, and installs simply hung in `queued`. `POST /extensions/install` now runs composer **inline** and returns the result in one response; the extension installs disabled and is activated with the enable toggle (WordPress-style). Also fixes the catalog `422` that hid any extension with release history. **The install API changed shape** (single response, no job polling); run `php glueful cache:clear` after upgrading.
::

### Key Highlights

::card
#title
Synchronous install — no queue, no polling
#description
The 1.66.0 installer ran `composer require` in a **detached** background process and exposed a `GET /extensions/install/{jobId}` endpoint the browser polled. But `PHP_BINARY` under a web SAPI (Apache mod_php, php-cgi, nginx+FPM) is not a CLI interpreter — forking it dropped the command's arguments, so the job never started and installs sat in `queued` forever. The installer is now **synchronous**: `POST /extensions/install` runs `composer require` inline and returns `{ status: 'installed' | 'failed', … }` in a single response (the request blocks for the duration of the composer run). composer is invoked as `<cli-php> <composer> require …` with an explicit child environment — including `COMPOSER_HOME` — so it doesn't depend on the web process's `PATH`, on `putenv()`, or on a writable `HOME`. On success the extension is installed **disabled**; activate it with the normal enable toggle. The job-poll endpoint, the `queued|running|…` states, and the internal `DetachedRunner` / `InstallJobStore` / `extensions:install-run` / `extensions:enable-installed` machinery are gone.
::

::card
#title
Type re-verification judges the latest release, not every one
#description
`ExtensionCatalog::hydrateVersion()` hydrates a package's version from Packagist's p2 metadata and re-verifies it is genuinely a `glueful-extension` before admitting it to the installable catalog. It did that by iterating **all** releases and dropping the package the moment one wasn't typed `glueful-extension`. But Packagist omits the `type` field for releases where it defaults to `library`, so any extension that adopted the type partway through its history — for example `glueful/entrada`, whose latest release is typed but whose older tags are not — was excluded from the catalog, and the install allowlist rejected it with a `422`. Re-verification now inspects the latest release only, which is exactly what Packagist's `type=glueful-extension` search already keys on.
::

### Migration Notes

- **The install API changed shape.** `POST /extensions/install` returns the final result directly instead of a job id, and `GET /extensions/install/{jobId}` has been removed — await the single request. The 1.66.0 detached installer never worked under a web SAPI, so no functioning integration is affected.
- **Env** (all optional): `EXTENSIONS_INSTALL_PHP_BINARY` — absolute path to a CLI php used to run composer (leave blank to auto-detect; set it when the web SAPI's php isn't a usable CLI interpreter, e.g. `/usr/bin/php` behind nginx+FPM). `COMPOSER_BINARY` — absolute composer path if it isn't on the web `PATH`. `EXTENSIONS_INSTALL_AUTO_ENABLE` has been removed.
- After upgrading, run `php glueful cache:clear` so the corrected installable-extension catalog is rebuilt (the 1.66.0 catalog cache can hide affected packages until its TTL lapses).

```bash
composer update glueful/framework
php glueful cache:clear
```

## v1.66.0 - Adhara
**Released: July 5, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-package"}
#description
**Install extensions from the admin UI — no SSH required.** A new install pipeline runs `composer require` for a catalog extension from the browser instead of the server terminal: the package is validated against the Packagist catalog, installed in a detached process that survives an FPM recycle, then auto-enabled in a fresh subprocess (to dodge the running worker's stale autoloader). Guarded by the `system.config` permission tier and a kill-switch that is **off in production by default**. Also fixes SVG uploads 400ing on the content check. **Minor** — three new optional `EXTENSIONS_INSTALL_*` env vars with safe defaults; no migrations, no breaking changes.
::

### Key Highlights

::card
#title
Browser-driven extension install (`composer require`, detached)
#description
`ExtensionInstaller::start()` validates the requested package against the resolved Packagist catalog (membership allowlist plus a `glueful/` vendor prefix — a substring match is not enough) and runs no shell. It then spawns `composer require` in a **detached** process via `extensions:install-run` (`proc_open` with array argv and `setsid`, so the install survives a PHP-FPM recycle mid-run). On success the extension is auto-enabled in a **fresh PHP subprocess** (`extensions:enable-installed`) — the running worker's autoloader can't see a package that didn't exist when it booted, so enabling in-process would fail — and the extension cache is rewritten. The client polls a `CacheStore`-backed job store whose status walks `queued → running → succeeded | failed | installed_not_enabled`. New building blocks ship under `src/Extensions/Install/` and `src/Support/Process/`, alongside an `ExtensionCatalog` (two-stage Packagist fetch filtered to `type=glueful-extension`) and a batteries-included `ExtensionsController` at `/api/v1/extensions`.
::

::card
#title
Guardrails on the install path
#description
The installer is gated by the `system.config` permission tier and the `EXTENSIONS_INSTALL_ENABLED` kill-switch, which defaults **on outside production and off in production**. A host-writability preflight returns `409` on a read-only deploy before any process is spawned, the package must be a member of the resolved catalog, and every install is written to the audit log. To expose the installer in production you must explicitly set `EXTENSIONS_INSTALL_ENABLED=true` and ensure the vendor tree is writable by the web user.
::

::card
#title
SVG uploads no longer 400 on the content check
#description
`FileUploader::validateFileContent()` re-checked the detected MIME against the hard-coded `DEFAULT_ALLOWED_MIME_TYPES` constant, overruling the configured `uploads.allowed_types` that the claimed-MIME gate had already honored — so an `image/svg+xml` upload permitted under `image/*` passed the first gate and then failed content validation with "Invalid file type". The content check now uses the same configured allowlist (wildcards included; unconfigured installs still fall back to the default constant). Safety posture is unchanged: SVG stays out of `isSafeInlineMime` (served as an attachment, never inline) and the hazard scan still rejects `<script>`-bearing payloads.
::

### Migration Notes

- **Nothing required to upgrade.** The new `install` block in `config/extensions.php` ships with working defaults.
- **New optional env vars** for the extension installer:
  - `EXTENSIONS_INSTALL_ENABLED` — master kill-switch; defaults on outside production, off in production.
  - `EXTENSIONS_INSTALL_AUTO_ENABLE` (default `true`) — auto-enable right after a successful install.
  - `EXTENSIONS_INSTALL_TIMEOUT` (default `600`) — seconds before a `composer require` run is timed out.
- **To use the installer in production**, set `EXTENSIONS_INSTALL_ENABLED=true` and make the deploy's `vendor/` tree writable by the web user.

```bash
composer update glueful/framework
```

## v1.65.3 - Acrux
**Released: July 3, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug"}
#description
**Random-string buffer overrun and static-asset MIME fixes.** `RandomStringGenerator::generate()` could read past its random-byte buffer under unlucky rejection sampling — an intermittent "Uninitialized string offset" in anything generating passwords or tokens, and a quiet output-bias risk. Separately, static assets served through `serveFrontend()` were content-sniffed to `text/plain`, which the accompanying `nosniff` header turns into browsers refusing CSS and module scripts outright. **Patch** — bugfixes only, no new env, no migrations, no behavioral changes.
::

### Key Highlights

::card
#title
`RandomStringGenerator` rejection sampling stays inside its buffer
#description
The generator's rejection-sampling inner loop (`while ($idx >= $charsetLength)`) consumes random bytes but had no refill guard — only the outer loop refills — so rejections clustering at the buffer's end walked past it. With a 79-character charset (the secure-password default) that's roughly a 1% failure per 16-character generate: rare enough to pass locally, frequent enough to flake CI in consumers that import users or mint credentials. There was also a subtler correctness angle: outside strict error handling, reading past the buffer yields `''` and `ord('')` returns 0, silently biasing generated secrets toward the charset's first character. The inner loop now refills before every read, and a regression test hammers the worst-case charset (65 characters, ~49% rejection per draw) with warnings escalated to failures.
::

::card
#title
`serveFrontend()` assets get extension-mapped MIME types
#description
`frontendAssetServer()` asked Symfony's `MimeTypes::guessMimeType()` first, which content-sniffs via finfo — and CSS/JS carry no magic bytes, so finfo answers `text/plain`. Because these responses also send `X-Content-Type-Options: nosniff`, browsers are *required* to refuse such stylesheets and module scripts, breaking theme CSS and SPA bundles on any `serveFrontend()` mount. The extension map now wins for known extensions (`css` → `text/css`, `js` → `text/javascript`); content sniffing remains the fallback for extensionless files only.
::

### Migration Notes

- **Nothing required.** Pure bugfix patch — no new env, no migrations, no behavioral changes.

```bash
composer update glueful/framework
```

## v1.65.2 - Acrux
**Released: July 2, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug"}
#description
**Array-valued field-selection params no longer 500.** A public read/delivery endpoint that builds its `FieldSelector` from the request would return an unhandled 500 when a client sent `fields`/`expand` as an array (`?fields[]=a`), because Symfony's `InputBag` rejects non-scalar values. Field selection is a scalar syntax, so those params are now read tolerantly and an array value is treated as "no selection". **Patch** — bugfix only, no new env, no migrations, no behavioral changes.
::

### Key Highlights

::card
#title
`FieldSelector` tolerates malformed array params
#description
`FieldSelector::fromRequest()` and `fromRequestAdvanced()` read `fields`/`expand` via `Request::query->get()`, which throws a `BadRequestException` when the parameter arrives as an array — surfacing as a 500 on any public endpoint that derives its selector from the request. Both factories now read via `query->all()` and treat any non-string value as absent, landing on the existing "no field selection" fast path. Scalar `fields`/`expand` parse exactly as before, so nothing changes for well-formed requests.
::

### Migration Notes

- **Nothing required.** Pure bugfix patch — no new env, no migrations, no behavioral changes.

```bash
composer update glueful/framework
```

## v1.65.1 - Acrux
**Released: July 1, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug"}
#description
**Extension-toggle and CLI hygiene fixes.** `php glueful extensions:enable`/`disable` no longer leave a stray trailing-whitespace line in `config/extensions.php` (which tripped phpcs/CI on the very next lint), and four console commands that were unrunnable due to option-shortcut clashes with Symfony's globals now start cleanly. **Patch** — bugfixes only, no new env, no migrations, no behavioral changes.
::

### Key Highlights

::card
#title
`extensions:enable`/`disable` write clean config
#description
`ExtensionStateWriter::writeList()` captured the whitespace before the closing bracket and re-emitted a literal indent in front of it, producing a dangling 4-space line above `]` on every toggle — which then failed `Squiz.WhiteSpace.SuperfluousWhitespace` in phpcs/CI. The writer now folds that whitespace into the match and writes the closing indent and bracket cleanly, so toggling an extension no longer dirties the file with a lint violation.
::

::card
#title
Console commands no longer clash with global shortcuts
#description
Four commands declared option shortcuts that collided with Symfony's reserved globals, so the definition merge threw `An option with shortcut "…" already exists` on both run and `help` — making the command unrunnable. `serve --queue` dropped its `-q` (clashed with `-q/--quiet`), `cache:expire --verify` and `di:container:compile --validate` dropped their `-v` (clashed with `-v/--verbose`), and `install --quiet` (meaning "non-interactive", not "suppress output") was renamed `--unattended`. All long options are preserved; only the colliding shortcuts changed.
::

### Migration Notes

- **Nothing required.** Pure bugfix patch — no new env, no migrations, no behavioral changes. If you scripted `php glueful install --quiet` for unattended installs, switch it to `--unattended` (the global `-q/--quiet` now resolves normally on that command).

```bash
composer update glueful/framework
```

## v1.65.0 - Acrux
**Released: June 30, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-database"}
#description
**Database, validation, and routing improvements.** New `QueryBuilder::forceDelete()` (hard-delete on a soft-deletable table without dropping to raw SQL), validator coercion rules (`CastToInt` / `CastToBoolean` / `CastToDate`), a `DbUnique` exclude-by-column argument, an `api_key_uuid` request attribute for per-key attribution, and `ServiceProvider::resetLoadedRoutes()` for clean re-boots. Plus three routing/schema fixes — `auth.user` is always populated after auth, file-defined `require_scope:` params are now enforced, and `alterTable()->dropColumn()` actually drops. **Minor** — no new env, no migrations; scope enforcement is tightened (see Migration Notes).
::

### Key Highlights

::card
#title
Database & validation toolbelt
#description
`QueryBuilder::forceDelete()` permanently deletes matching rows, bypassing soft-delete even on a table with a `deleted_at` column — previously the only way to hard-delete such a row (e.g. to re-insert a unique key during an upsert) was raw SQL. New `MutatingRule`s — `CastToInt`, `CastToBoolean`, `CastToDate` — let a validator pipeline both coerce and validate (`filtered()` used to return uncoerced input). And `DbUnique` gains a fifth `$exceptColumn` argument (default `'id'`) so a record keyed by a non-`id` column like `uuid` can exclude the current row on update.
::

::card
#title
Routing & schema correctness
#description
`AuthMiddleware` now always populates `auth.user` — it synthesises a basic `UserIdentity` (uuid, roles, scopes) when the optional enricher hasn't run, so permission gates and audit attribution never silently see a null principal. `RequireScopeMiddleware` now enforces scopes declared as a middleware param (`->middleware('require_scope:read:content')`) fail-closed; it previously fell open when no `#[RequireScope]` attribute was present. And `TableBuilder::alterTable()` now forwards `dropColumn()` to the SQL generator (it was a silent no-op). Also new: `ApiKeyAuthenticationProvider` exposes the acting key's `api_key_uuid`, and `ServiceProvider::resetLoadedRoutes()` lets a fresh `Framework::boot()` re-register extension routes.
::

### Migration Notes

- **Scope enforcement tightened.** If you declared a route's scope as a middleware param — `->middleware('require_scope:read:content')` — it was previously **not** enforced (it fell open) and now enforces **fail-closed**. Requests lacking the scope will correctly receive `403`. Routes using the `#[RequireScope]` attribute are unaffected. Everything else is additive — no new env, no migrations.

```bash
composer update glueful/framework
```

## v1.64.0 - Zosma
**Released: June 28, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-key"}
#description
**Configurable, auditable API keys — plus webhook and blob-visibility fixes.** `ApiKeyService` now reads its brand prefix from config (`API_KEY_PREFIX`, default `gf`) so apps can rebrand generated keys, and its create/rotate/revoke paths emit framework entity events so key lifecycle is auditable (identity only, never the secret). Also fixes three latent webhook-management bugs and a blob-visibility bug where "public" uploads were stored private and 401'd on retrieval. **Minor** — one new optional env (`API_KEY_PREFIX`), backward compatible, no migrations.
::

### Key Highlights

::card
#title
Rebrandable, auditable API keys
#description
The generated key prefix is no longer hard-coded: `ApiKeyService` reads `auth.api_keys.prefix` (env `API_KEY_PREFIX`, default `gf`), so `gf_live_…` can become `lm_live_…` per app (only the first 16 chars are the indexed lookup prefix, so keep it short). And `create` / `rotate` / `revoke` now emit `EntityCreatedEvent` / `EntityUpdatedEvent` for the `api_keys` table — an audit consumer can record who minted, rotated, or revoked a key. The payload is identity only (uuid, name, key_prefix, scopes) and never carries the plaintext or hash; dispatch is best-effort, so a failed audit never breaks the key operation.
::

::card
#title
Webhook management + blob visibility fixes
#description
Three latent webhook bugs are fixed (the core ships `WebhookController` but doesn't register its routes, so they surfaced only once an app mounted them against PostgreSQL): list endpoints 500'd on the strict query validator (`OFFSET` before `LIMIT`), `WebhookSubscription` inserts failed on PostgreSQL (timestamps bound through the string path), and the auto-created UUID columns were too narrow for the generated ids. Separately, `FileUploader` now persists the requested blob `visibility` — previously every upload fell back to `private`, so a "public" image 401'd on `GET /blobs/{uuid}`.
::

### Migration Notes

- **Nothing required.** Backward compatible: `API_KEY_PREFIX` defaults to `gf` (reproduces existing keys), and no migrations ship. Set `API_KEY_PREFIX` only if you want to rebrand keys. To audit key lifecycle, ensure an audit consumer is listening for the `api_keys` entity events.

```bash
composer update glueful/framework
```

## v1.63.5 - Yildun
**Released: June 27, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-api"}
#description
**The webhook management API is now fully typed in OpenAPI.** 1.63.4 added operation summaries to `WebhookController`; this fills in the schemas — query parameters, request bodies, and response shapes — so an application that mounts the controller gets a precise spec (and a typed client) for subscriptions and deliveries, not just path stubs. **Patch** — documentation metadata only (new doc-only DTOs + attributes), no behavioral change, no new env, no migrations.
::

### Key Highlights

::card
#title
Typed query params, bodies, and responses for webhooks
#description
Added `#[QueryParam]` for the list/stats query parameters (active / status / subscription / page / per_page / days), `#[ApiRequestBody]` for create/update, and `#[ApiResponse(schema: …)]` for the subscription, delivery, list, and stats responses — backed by new documentation-only DTOs under `Glueful\Api\Webhooks\DTOs`. The controller's runtime behavior is unchanged; the DTOs are reflected for docs only (never hydrated), the same approach the auth controller uses for `login`.
::

### Migration Notes

- **Nothing required.** Documentation metadata only. After `composer update`, re-run `generate:openapi` (and your client codegen) to pick up the fully-typed webhook endpoints.

```bash
composer update glueful/framework
```

## v1.63.4 - Yildun
**Released: June 27, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-api"}
#description
**The webhook management API is now self-documenting.** The framework ships a complete `WebhookController` (subscription + delivery management), but its methods carried no OpenAPI attributes — so an application that mounts these routes got working endpoints that were invisible to `generate:openapi` and the typed client. All 11 endpoints now carry `#[ApiOperation]`/`#[ApiResponse]`. **Patch** — documentation metadata only, no behavioral change, no new env, no migrations.
::

### Key Highlights

::card
#title
`WebhookController` endpoints appear in generated docs
#description
The 11 webhook-management methods — subscription list/create/get/update/delete, rotate-secret, test, stats, plus delivery list/get/retry — now carry `#[ApiOperation]` + `#[ApiResponse]` attributes. Applications that mount the controller (the core does not auto-register these routes) pick them up in `openapi.json` and the typed client, exactly like any other annotated controller. Nothing about the routes, behavior, or signatures changed.
::

### Migration Notes

- **Nothing required.** Documentation metadata only. After `composer update`, re-run `generate:openapi` (and your client codegen) to surface the webhook endpoints in your spec.

```bash
composer update glueful/framework
```

## v1.63.3 - Yildun
**Released: June 26, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bug"}
#description
**Blob writes are now auditable.** `BlobRepository` was constructed without an `ApplicationContext`, so its create/update/delete never dispatched entity events — blob **uploads emitted no `EntityCreatedEvent`** and silently couldn't be audited. It's now built with the context, so uploads emit events an audit/activity consumer can record. **Bugfix patch** — no new env, no migrations.
::

### Migration Notes

- **Nothing required.** Bugfix only.

```bash
composer update glueful/framework
```

## v1.63.2 - Yildun
**Released: June 26, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bug"}
#description
**Image-variant caching fix.** Serving a resized blob variant (`GET /blobs/{uuid}?width=…`) with the variant cache enabled returned a 500: `UploadController` cached the rendered image as **raw bytes**, which a JSON-based cache serializer (e.g. the Redis driver's `SecureSerializer`) can't encode — raw bytes aren't valid UTF-8 — so every cached resize threw `Malformed UTF-8`. The un-resized original was unaffected. **Bugfix patch** — no new env, no migrations.
::

### Key Highlights

::card
#title
Resized image variants are cached correctly
#description
The rendered variant is now stored **base64-encoded** and decoded on read, so the binary survives any cache serializer (JSON or otherwise). A legacy/corrupt cache entry that fails to decode simply falls through to a re-render. Lets you keep `UPLOADS_CACHE_ENABLED=true` for on-the-fly thumbnails/resizes without the serializer choking on image bytes.
::

### Migration Notes

- **Nothing required.** Bugfix only; no env or config changes, no migrations.

```bash
composer update glueful/framework
```

## v1.63.1 - Yildun
**Released: June 25, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bug"}
#description
**Resilient event dispatch + dead auth events.** Auth/security events (logins, logouts, failed logins, security violations) were silently not reaching their listeners: `ActivityLoggingSubscriber` — the first listener on every auth/security event — was unresolvable (it required a `LogManager` the container never registers), so it threw; and the dispatcher didn't isolate listener failures, so that one throw aborted the whole dispatch before any later listener ran. The session dispatcher swallowed the error, so logins succeeded with nothing logged. **Bugfix patch** — no new env, no migrations.
::

### Key Highlights

::card
#title
A throwing listener no longer starves the rest of the chain
#description
`EventDispatcher::dispatch()` now catches each listener's `Throwable`, logs it, and continues to the next listener (hot and traced paths). Previously the first listener to throw — a resolution failure or a runtime error — ended dispatch for that event entirely, silently starving every listener after it (cache invalidation, an audit/notification subscriber, …). One broken or misconfigured listener can no longer take the whole event down with it.
::

::card
#title
`ActivityLoggingSubscriber` is resolvable again
#description
It required a non-nullable `LogManager`, which is not a container-registered service, so the autowiring resolver couldn't construct it — making the subscriber throw on every auth/security event. Its constructor now takes `?LogManager $logger = null` and falls back to `LogManager::getInstance()`. Combined with the dispatcher fix, login/logout/security events are delivered to all listeners again — the framework's own activity logging plus any app or extension subscriber (e.g. `glueful/audit`).
::

::card
#title
Failed logins now emit `AuthenticationFailedEvent`
#description
The event was declared and listeners subscribed to it, but nothing ever dispatched it — so failed login attempts were invisible to activity logging and audit consumers. `AuthenticationService::verifyCredentials()` now dispatches it (best-effort and context-guarded — it never breaks the login flow) when credentials are rejected (`invalid_credentials`) or the resolved account is disabled (`user_disabled`), carrying the attempted username plus the request's client IP and user-agent when available.
::

### Migration Notes

- **Nothing required.** Both are bugfixes; no env or config changes, no migrations.

```bash
composer update glueful/framework
```

## v1.63.0 - Yildun
**Released: June 25, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-broadcast"}
#description
**Entity-deletion event + subclass domain-event dispatch.** `BaseRepository` now emits an `EntityDeletedEvent` on a successful delete — completing the create/update/delete triplet so audit, cache-invalidation and notification consumers can react to deletes, not just writes. And the repository's event-dispatch helper is now `protected`, so repository subclasses (including those in extensions) can emit their own domain events through the same best-effort path. **Additive** — a new event (fires only if subscribed) plus a visibility widening; no env, no migrations.
::

### Key Highlights

::card
#title
`EntityDeletedEvent` completes the entity CRUD event triplet
#description
`BaseRepository::delete()` now dispatches `Glueful\Events\Database\EntityDeletedEvent` after a successful delete (`affected_rows > 0`). It carries the **pre-delete** record — read before the row is removed — so consumers can derive the deleted entity's identity and labels, plus metadata matching the create/update events (`entity_id`, `primary_key`, `affected_rows`, `operation: 'delete'`). It mirrors `EntityCreatedEvent`'s surface (`getEntity()` / `getEntityId()` / `getTable()` / `getCacheTags()` / `isUserRelated()`, with a `getOriginalData()` alias). No-op deletes (missing row, zero affected) emit nothing. Audit trails, cache invalidation, and notifications can finally react to deletes as first-class events.
::

::card
#title
Repository subclasses can emit their own domain events
#description
`BaseRepository::dispatchEvent()` is now `protected` (was `private`), so repository subclasses — including those in extensions — can emit their own semantic domain events through the framework's best-effort, context-guarded dispatch helper (it no-ops when the repository was constructed without an `ApplicationContext`). This is the seam an RBAC or audit extension uses to publish meaningful events (e.g. "role assigned") instead of raw table writes. No behavior change for existing repositories.
::

### Migration Notes

- **Nothing required.** Both changes are additive; behavior is unchanged unless you subscribe to the new event or emit one from a subclass.

```bash
composer update glueful/framework
```

## v1.62.0 - Xuange
**Released: June 24, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-puzzle"}
#description
**User-record enrichment seam.** A new core contract lets an authorization extension attach fields — like a user's `roles` — to the records an identity store returns (`/users`, `/users/{uuid}`, `/me`), without the two extensions depending on each other. The read-side symmetric of the existing login-time `identity.claims_provider` seam. **Additive** — nothing changes unless an extension registers an enricher; no env, no migrations.
::

### Key Highlights

::card
#title
`UserRecordEnricherInterface` + the `users.record_enricher` tag
#description
An enricher receives a **batch** of user UUIDs and returns additive fields to merge per record (e.g. `{ roles: [...] }`). A consumer — the identity store's read endpoints — collects every service tagged `users.record_enricher` and folds their output into each user record. Implementations must resolve the whole batch in one query (no N+1) and may only **add** fields (they can't change identity facts). It mirrors `IdentityClaimsProviderInterface`, which enriches the authenticated principal at login; this enriches arbitrary read payloads. The upshot: `glueful/users` can show each user's roles inline (no extra round-trip, no click) while staying fully decoupled from `glueful/aegis`.
::

### Migration Notes

- **Nothing required.** The contract is additive; behavior is unchanged until an extension registers an enricher.

```bash
composer update glueful/framework
```

## v1.61.2 - Wezen
**Released: June 23, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-lock-exclamation"}
#description
**Permission gate fail-closed fix.** Every `#[RequiresPermission]` / `gate_permissions` route returned **403 for fully authorized users** — the `auth.user` principal the gate reads was never populated because `AuthMiddleware`'s enricher lookup used a container id that never matched, so the enricher silently never ran. Routes guarded by attribute permissions (admin/RBAC/i18n endpoints) were unreachable. **Bugfix patch** — no new env, no migrations.
::

### Key Highlights

::card
#title
`#[RequiresPermission]` routes no longer 403 authorized users
#description
`AuthMiddleware::autoEnrichRequest()` looked up the `auth.user` enricher by a **leading-backslash** string id (`'\Glueful\Permissions\Middleware\AuthToRequestAttributesMiddleware'`), but the container registers it under the `::class` form (no leading backslash) and does not normalize the two — so `Container::has()` returned false, the enricher never ran, and the `auth.user` `UserIdentity` was never set. `GateAttributeMiddleware` then saw a null principal and denied. The lookup now uses `AuthToRequestAttributesMiddleware::class`, matching the container key, so the gate sees the authenticated principal and authorizes correctly.
::

::card
#title
File / Memcached cache drivers accept colon-namespaced keys
#description
`FileCacheDriver` and `MemcachedCacheDriver` rejected `:` as a PSR-16 reserved character, but the framework namespaces every cache key with a colon (`session:`, `provider:`, `user_permissions:`). Login on a file or Memcached backend failed the moment `SessionCacheManager` stored the session. Both drivers now allow `:`, matching Redis (the file driver md5-hashes keys into filenames; colons are valid Memcached keys).
::

### Migration Notes

- **Nothing required.** Bugfix only.

```bash
composer update glueful/framework
```

## v1.61.1 - Wezen
**Released: June 22, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-world-www"}
#description
**CORS on every response.** Cross-origin **error** and regular responses (422, 401, …) now carry `Access-Control-Allow-Origin`, so a separately-served frontend (e.g. a Vite dev SPA on another origin) can finally read their bodies. Previously only the OPTIONS preflight got CORS headers, leaving regular and error bodies blocked by the browser. **Bugfix patch** — no new env, no migrations, no action required.
::

### Key Highlights

::card
#title
CORS headers on regular and error responses
#description
`Application::handle()` now applies CORS to the **final** response in both the dispatch and exception-handler branches — the single chokepoint that sees success **and** error paths. A new public `Cors::applyToResponse(Request, Response)` decorates an already-built response with the regular-request CORS headers (`Access-Control-Allow-Origin`, `Vary: Origin`, and per-config `Expose-Headers` / `Allow-Credentials`). It is a no-op when there is no `Origin`, the origin is not allowed, or the header is already set — so it never clobbers the router's preflight responder.
::

### Migration Notes

- **Nothing required.** Same-origin requests and disallowed origins are unchanged; allowed cross-origin requests now receive the CORS headers they should always have had on regular and error responses.

```bash
composer update glueful/framework
```

## v1.61.0 - Wezen
**Released: June 20, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-tags"}
#description
**OpenAPI tag filtering.** The doc generator can now drop operations from the generated spec by **tag** (`documentation.options.tags.include` / `.exclude`, env-driven), so a consumer-facing spec can hide infrastructure groups (`Health`, `Documentation`, `Security`) without turning off whole route sources. **Additive and off by default** (empty lists = no filtering) — no breaking changes, no migrations.
::

### Key Highlights

::card
#title
Tag allow/deny for the OpenAPI spec
#description
New `documentation.options.tags.include` (allow-list; empty = keep all) and `.exclude` (deny-list; wins over include), set via `API_DOCS_INCLUDE_TAGS` / `API_DOCS_EXCLUDE_TAGS`. Operations are filtered *before* the spec is written, so dropped operations take their now-unreferenced tags **and** schemas with them. This lets you expose the framework/extension routes a consumer needs while hiding infra groups — finer-grained than the all-or-nothing `include_framework_routes` / `include_extensions` switches. The core is a pure, unit-tested static `DocGenerator::filterPathsByTags()`.
::

::card
#title
Doc-config cleanup
#description
Removed the dead `documentation.paths.route_definitions` and `extension_definitions` keys. They pointed at the (removed) comment generator's `json-definitions/{routes,extensions}/` output dirs and were never read by the reflect generator, which merges only top-level `docs/json-definitions/*.json` fragments.
::

### Migration Notes

- **Nothing required.** Filtering is off by default (both lists empty). To use it, set e.g. `API_DOCS_EXCLUDE_TAGS="Health,Documentation,Security"` and regenerate the spec.
- The removed `route_definitions` / `extension_definitions` config keys were already inert — safe to delete if you copied them into your app's config.

```bash
composer update glueful/framework
```

## v1.60.0 - Vega
**Released: June 19, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-database-cog"}
#description
**Engine-agnostic installer + first-run setup seams.** `php glueful install` now configures and migrates **any** database engine (MySQL/PostgreSQL/SQLite) — not just SQLite — and a new `Glueful\Installer\` toolkit lets an app drive first-run setup from CLI **or** a UI without shelling out. **Additive** (no breaking API changes, no new env, no migrations) — but `install` is now interactive, so non-interactive callers should pass `--quiet`.
::

### Key Highlights

::card
#title
install works with any database engine
#description
The old install command set up SQLite only — any other engine was silently skipped. It now tests the connection and runs migrations against the **configured** engine, with the previously-orphaned interactive credential prompts (engine, host, port, db, user, password) reconnected. The command itself shrank from 710 to 238 lines, delegating to a reusable orchestrator.
::

::card
#title
Glueful\Installer\ seams (CLI or UI, no shelling out)
#description
`EnvWriter` (atomic, quoted `.env` writes — now the single writer, replacing two unsafe copies), `ConnectionTester` (transient probe of explicit credentials with a short connect timeout + a typed result that never leaks the password), `Installer` (a preflight-first pipeline returning a step-based result a UI can render), plus `DatabaseConfig` and `InstallState`. Two hard invariants hold by construction: a failed connection test mutates nothing (`.env` untouched), and the tested credentials are exactly the connection migrations run on.
::

::card
#title
Safer .env + correct PostgreSQL DSN
#description
`.env` writes are now quoted/escaped and atomic, so a password containing spaces, `#`, `=`, or quotes no longer corrupts the file. `MigrationManager` accepts an optional injected `Connection` (additive). PostgreSQL `sslmode` and `connect_timeout` now reach the DSN, so an SSL-required server connects correctly and an unreachable host fails fast instead of hanging.
::

### Migration Notes

- **`php glueful install` is now interactive.** It prompts for the database engine + credentials by default. **Non-interactive callers** (CI, `post-create-project-cmd`, scripts) should pass **`--quiet`** to use the existing `.env` without prompts, or **`--skip-database`** to skip DB setup/migrations. The api-skeleton's `post-create-project-cmd` is updated accordingly.
- No env, config, or migration changes.

```bash
composer update glueful/framework
```

## v1.59.0 - Unukalhai
**Released: June 19, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-layout-dashboard"}
#description
**First-party frontend serving.** A new `ServiceProvider::serveFrontend()` seam serves a built SPA or static bundle at any **literal** path (e.g. `/admin`) — with secure asset serving, an `index.html` deep-link fallback, and a content-hash-aware cache split. It **replaces and removes** `mountStatic()` (which only mounted at `/extensions/{mount}` and had no SPA fallback). **One small migration** if you used `mountStatic()`; everything else is additive.
::

### Key Highlights

::card
#title
serveFrontend() — serve a SPA at any literal path
#description
`$this->serveFrontend('/admin', $dir)` mounts a built bundle at a literal path: real files stream with mime + `SecurityHeaders` + ETag/304, content-hashed assets get `immutable` caching while `index.html` and unhashed files get `no-cache` (so a new deploy is always seen), and any non-asset path falls back to `index.html` for client-side routing. Pass `['spaFallback' => false]` for a plain static bundle that 404s on a miss. Path traversal, dotfiles, and `.php` are denied; the mount path is a strict literal (request trailing slashes are normalized by the router).
::

::card
#title
OpenAPI: less boilerplate per endpoint
#description
The reflect generator's auto-inferred `401`/`403`/`429` responses now carry a default `{success, message}` JSON body (configurable via `documentation.errors`, including always-emitted statuses like `500`), and `#[FromQuery]`/`#[FromRoute]` accept optional `description`/`example`. Together these let you move query/path params into a typed DTO and delete the repeated `#[QueryParam]`/`#[ApiResponse]` walls — without losing any documentation.
::

::card
#title
HEAD requests to file responses no longer 500
#description
`Router::dispatch()` stripped the `HEAD` body with `setContent('')`, which `BinaryFileResponse` rejects — so a `HEAD` to any file/download route (including the docs UI and the new `serveFrontend()` routes) could 500. It now swaps in a body-less `Response` that preserves status and headers. Affects every file response, not just the new seam.
::

### Migration Notes

- **`mountStatic()` is removed.** Replace `$this->mountStatic('foo', $dir)` (served at `/extensions/foo`) with `$this->serveFrontend('/foo', $dir)` (any literal path + `index.html` fallback). For a plain bundle that 404s on a miss, use `$this->serveFrontend('/foo', $dir, ['spaFallback' => false])`. `serveFrontend()` no-ops with a warning if the bundle has no `index.html` (when `spaFallback` is on).
- The unused `SpaManager` / `StaticFileDetector` / `SpaProvider` are removed (dead code, no callers). No config, env, or migrations.

```bash
composer update glueful/framework
```

## v1.58.1 - Thuban
**Released: June 15, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-api"}
#description
**OpenAPI response-schema fidelity.** Three additive reflect-generator fixes so typed `ResponseData` DTOs document response bodies accurately — the success envelope marks its keys `required`, and `#[ArrayOf]` now resolves array `items` in response mode. **Fully additive:** no behavior change for request DTOs, no config/env changes, nothing to migrate.
::

### Key Highlights

::card
#title
#[ArrayOf] now works on response DTOs
#description
`ClassSchemaReflector` resolves array `items` from `#[ArrayOf]` for `ResponseData` DTOs too — previously response mode read only the `@var Foo[]` docblock. `#[ArrayOf]` is now the consistent array element-type source for both request and response DTOs. To support response-DTO item types, the `#[ArrayOf]` attribute is relaxed to target any class (it no longer requires the target to implement `RequestData`).
::

::card
#title
Success envelope marks its keys required
#description
The reflected single-object success envelope now emits `required: [success, message, data]`, matching the flat-pagination envelope which already did. SDK generators and validators get an accurate contract for the always-present envelope keys.
::

::card
#title
Request-DTO safety preserved
#description
Relaxing `#[ArrayOf]` would have dropped the guarantee that a **request** DTO's array elements implement `RequestData`. That constraint moves into `RequestDataHydrator`, where it now fails loud (`LogicException`) alongside the other v2 structural-misuse guards (dual-source, nested-source). Request-DTO behavior is unchanged.
::

### Migration Notes

- Nothing to migrate. Fully additive — no behavior change for request DTOs, no config or env changes.

```bash
composer update glueful/framework
```

## v1.58.0 - Thuban
**Released: June 15, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-forms"}
#description
**Typed request-DTO hydration v2.** `RequestData` DTOs now handle arrays, nested DTOs, and path/query inputs — closing the v1 "flat-scalars, JSON-body-only" boundaries from 1.57.0. **Fully additive:** flat scalar v1 DTOs are byte-identical, there are no config or env changes, and nothing to migrate.
::

### Key Highlights

::card
#title
Arrays & nested DTOs — no more TypeError sharp edge
#description
A `RequestData` field typed `array` can declare its element type with `#[ArrayOf('int')]` (scalars) or `#[ArrayOf(FieldData::class)]` (nested DTOs). Nested DTOs hydrate recursively and validate per element, and **every failure is a clean `422`** with dot-path error keys (`schema.0.name`) — never a `TypeError`/500. Recursion is depth-capped, and `#[ArrayOf]` is the sole element-type source for request DTOs (`@var` is not read).
::

::card
#title
Path & query sources via #[FromRoute] / #[FromQuery]
#description
A DTO field can be sourced from the route path or the query string — not only the JSON body — with explicit `#[FromRoute]`/`#[FromQuery]` attributes (body is the default; one source per field, no precedence guesswork). The OpenAPI reflect generator emits them as `path`/`query` parameters and excludes them from the request-body schema. Misuse — both attributes on one field, a source attribute on a nested DTO, or a `#[FromRoute]` with no matching `{placeholder}` — fails loud, including at spec generation.
::

::card
#title
Cross-field validation & custom rules
#description
Implement `ValidatesSelf` for a post-hydration `validate()` hook covering cross-field invariants (e.g. "publishedAt required when status=published"), merged into the same `422`. Register reusable custom rules through a container-bound `RuleRegistry` and use them by name in `#[Rule('required|reserved_username')]`; built-in rule names are always reserved.
::

### Migration Notes

- Nothing to migrate. Fully additive — existing flat-scalar `RequestData` DTOs behave identically, and there are no config or env changes.

```bash
composer update glueful/framework
```

## v1.57.0 - Sargas
**Released: June 14, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-api"}
#description
A **types-first I/O** convention and a **single code-first OpenAPI generator**. Controllers can now express request/response shapes as typed DTOs that drive *both* the runtime envelope and the generated spec; the OpenAPI generator is consolidated to the code-first `reflect` engine and the legacy docblock-parsing `comments` generator is removed. Mostly additive, but it ships as a minor for one breaking change. **If you used the `comments` OpenAPI generator or documented routes with `@route`/`@response` docblocks, read the Migration Notes.**
::

### Key Highlights

::card
#title
Types-first request & response DTOs
#description
A controller parameter implementing `RequestData` is hydrated + validated from the JSON body (`#[Rule]` constraints, auto-`422`); a method returning a `ResponseData` is auto-enveloped into `{success, message, data}` (`#[ResponseStatus]` sets the status, `HasResponseMessage` supplies a custom message). `CollectionResponse`/`PaginatedResponse` cover list endpoints, and a returned `JsonResource`/`ResourceCollection`/`PaginatedResourceResponse` is auto-normalized through its own `toResponse()`. One typed class drives both the runtime payload and the OpenAPI schema. A new `php glueful scaffold:dto` command scaffolds request/response DTOs.
::

::card
#title
One code-first OpenAPI generator
#description
The legacy docblock-parsing `comments` generator is removed; the code-first `reflect` generator — which derives paths, params, per-route security, and request/response schemas from the live route table + types — is now the only generator. A minimal typed attribute surface fills the gaps types can't express: `#[ApiOperation]` (summary/description/tags), `#[QueryParam]` (arbitrary query params), `#[ApiRequestBody]` (multipart + doc-only JSON DTO-class bodies), and `#[ApiResponse]` with a `body:` mode for binary/text responses. `reflect ⊇ comment` was proven over the live route table before the comment parser was deleted.
::

::card
#title
Reference adoption across core controllers
#description
The framework's own auth, upload, resource, and health controllers adopt the convention as worked examples (each behavior-preserving, characterization-tested) — and document the convention's boundaries: where typed DTOs apply, and where manual responses remain (polymorphic bodies, multipart input, binary/stream serving, response-level headers/caching).
::

### Migration Notes

- The comment-based OpenAPI generator has been **removed**; `reflect` is now the only OpenAPI generator.
- `documentation.generator` and `API_DOCS_GENERATOR` are no longer supported — remove them from config/env (the value is ignored).
- Route `@route`, `@summary`, `@requestBody`, `@response`, and related docblock annotations are **no longer read**.
- Document endpoints with typed DTOs plus `#[ApiOperation]`, `#[QueryParam]`, `#[ApiRequestBody]`, and `#[ApiResponse]`. See the OpenAPI reflect guide.
- No migrations.

```bash
composer update glueful/framework
```

## v1.56.0 - Rastaban
**Released: June 13, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-shield-lock"}
#description
The **second wave** of the June 2026 security & correctness hardening pass: queue/scheduler payload signing, SSRF-safe HTTP with validated-DNS pinning, unified sensitive-parameter redaction, fail-closed CORS/image defaults, and JWT temporal-claim enforcement. Almost entirely fixes, but several change defaults or add config/env vars (CORS credentials off by default; remote image fetch opt-in; queue/scheduler payloads signed by default; JWT requires `exp`) -- so it ships as a minor. **Read the Migration Notes before upgrading.**
::

### Key Highlights

::card
#title
Queue & scheduler payloads are signed and gated
#description
Persisted database/Redis queue payloads and scheduled-job envelopes are HMAC-signed (handler class + parameters, plus the row's name and cron schedule) and verified before a handler is resolved or run. Stored handler classes must now implement `JobInterface` to be instantiated -- writing a class name into a queue/scheduler backend can no longer trigger an arbitrary constructor. Signing is on by default (`QUEUE_PAYLOAD_SIGNING` / `QUEUE_REQUIRE_SIGNED_PAYLOADS`) and inert without an `APP_KEY`.
::

::card
#title
SSRF-safe HTTP + unified redaction
#description
`Client::safeRequest()` / `safeFetch()` / `safeRequestAsync()` validate the scheme, resolve, and public-IP-pin **every** redirect hop, and pin the validated DNS result to reduce rebinding exposure; webhook delivery and external health checks use the safe path. Sensitive-parameter redaction is unified in one `SensitiveParamRedactor` across request/response logging, exception reporting, auth access logs, and the security-violation listener, and rate-limit cache keys now hash IP/identifier material.
::

::card
#title
Fail-closed defaults + JWT temporal claims
#description
The standalone `Glueful\Http\Cors` handler no longer defaults open, and `CORS_SUPPORTS_CREDENTIALS` now defaults to `false` (wildcard origin + credentials is refused at emit time). `ImageSecurityValidator` defaults to an empty allow-list with external URLs disabled. `JWTService::decode()` now requires bounded `exp` / `nbf` / `iat`, so a token minted without an expiry no longer validates. File encryption moves to chunked authenticated streaming and rejects all-zero keys.
::

### Migration Notes

- **CORS fails closed.** The standalone handler no longer allows all origins by default, and `CORS_SUPPORTS_CREDENTIALS` now defaults to `false`. Set `CORS_ALLOWED_ORIGINS` (and `CORS_SUPPORTS_CREDENTIALS=true` only if you genuinely need credentialed cross-origin requests).
- **Remote image fetching is opt-in.** With no `image.security` config, external image URLs are disabled and the allow-list is empty. Configure `image.security.allowed_domains` or install/configure `glueful/media`.
- **Queue & scheduler payloads are signed by default.** `QUEUE_PAYLOAD_SIGNING` / `QUEUE_REQUIRE_SIGNED_PAYLOADS` default on (inert without `APP_KEY`). To drain legacy unsigned rows, temporarily set `QUEUE_REQUIRE_SIGNED_PAYLOADS=false`. Custom queue/scheduler handlers must implement `JobInterface`.
- **JWT requires `exp`.** Tokens without `exp` (or with expired/non-numeric `exp`, future `nbf`/`iat`) are rejected.
- **Memcached cache format changed.** Flush the cache when upgrading a Memcached-backed deployment -- raw legacy string values that aren't valid serialized data now throw on read.
- **Set `TRUSTED_PROXIES`** behind a load balancer so client IPs resolve correctly. New optional `http.safe_fetch.max_redirects` (default `3`). No migrations.

```bash
composer update glueful/framework
```

## v1.55.0 - Peacock
**Released: June 11, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-shield-lock"}
#description
A **security & correctness hardening** release: a focused pass over routing/permissions, auth, storage paths, the database write-path, deserialization, and the container/extension boundary, from a five-part framework review. Mostly bug fixes, but several change behavior or defaults (permission attributes now enforce; API-key query param off by default; signed URLs fail closed without a secret; extensions fail loud at boot) and one adds a feature (range UPDATE/DELETE predicates) -- so it ships as a minor. **Read the Migration Notes before upgrading.**
::

### Key Highlights

::card
#title
Route permission attributes now actually enforce
#description
`#[RequiresPermission]` / `#[RequiresRole]` were silently unenforced -- the Router never populated the `handler_meta` the gate middleware reads, and the `gate_permissions` middleware was never auto-attached. Both are fixed: the Router derives `handler_meta` after route match, and `AttributeRouteLoader` auto-attaches the gate for attributes on the **method or the handler class**. **Behavioral:** a route annotated with a permission attribute but running without a permission provider bound now returns **403** instead of allowing the request.
::

::card
#title
Auth & storage hardening
#description
`#[RequireScope]` no longer passes for non-API-key (JWT) requests; the unverified-JWT claims fallback is removed (claims come only from signature-verified tokens); the `?api_key=` query string is **off by default** (set `security.api_keys.allow_query_param` to re-enable). Signed URLs **fail closed** when no signing secret is configured. All `FlysystemStorage` writes/reads/deletes route through PathGuard, so a traversal/absolute path can no longer reach the disk unvalidated.
::

::card
#title
Database integrity + injection hardening
#description
Soft-delete column cache is namespaced per connection (no cross-database poisoning of the soft-vs-hard delete decision); pooled connections roll back open transactions and reset session state before reuse; duplicate-column WHERE predicates on UPDATE/DELETE now **both apply** (range support) instead of silently collapsing to one (over-deletion). JOIN/HAVING/ORM-`has()` operators are allow-listed, JSON paths grammar-validated, and `wrapIdentifier()` doubles embedded quotes.
::

::card
#title
Container/extension boundary fails loud
#description
An extension whose `services()`/`defs()`/`tags()` throws is no longer silently dropped: it rethrows at boot outside production (recorded + WARNING-logged in production via `ContainerFactory::failedProviders()`), and a service bound to a bare interface/abstract is rejected at **load time** instead of fataling at first resolution. Closes the recurring extension-wiring bug class.
::

### Migration Notes

- **Permission attributes now enforce.** Routes using `#[RequiresPermission]`/`#[RequiresRole]` without a permission provider bound will now 403. Bind a provider (e.g. `glueful/aegis`), grant the permissions, or remove the attribute from open routes.
- **API key query string is off by default.** Move clients to the `X-API-Key` header, or set `security.api_keys.allow_query_param = true`.
- **Signed URLs require a secret.** Configure `uploads.signed_urls.secret` / `SIGNED_URL_SECRET` (or `app.key` / `APP_KEY`) -- a distinct value per environment. Generation/validation throws otherwise.
- **Extensions fail loud at boot (non-prod).** A previously-silent extension wiring failure will now surface; fix the binding (a bare interface id needs `['class' => Concrete::class]` or a factory).
- New optional config keys `security.api_keys.allow_query_param` / `security.csrf.rate_limit_fail_closed` (both default `false`). No new env vars, no migrations.

```bash
composer update glueful/framework
```

## v1.54.0 - Okab
**Released: June 10, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-plug-connected"}
#description
A coordinated release in three movements: a **container-precedence fix** that makes every "core default + extension override" seam genuinely overridable; the new **`Glueful\Entitlements` core seam** (contract-only — commercial capability gates for the forthcoming `glueful/subscriptions`); and a **storage driver registry** with the `s3`/`gcs`/`azure` factories **extracted to first-party provider packs** (breaking — lean core, same playbook as 1.52). `glueful/storage-s3` ships alongside (covers R2/MinIO/Spaces/Wasabi via presets); gcs/azure packs follow shortly.
::

### Key Highlights

::card
#title
Extension definitions now override core defaults (container precedence fix)
#description
`ContainerFactory` previously merged extension service definitions with `+=`, silently dropping any extension binding that collided with a core id — meaning `UserProviderInterface -> NullUserProvider` and every other "core default + extension override" seam was un-overridable through the normal provider path. Extension definitions now merge **over** core (`array_replace`), with `ApplicationContext` re-pinned so a framework-managed key can never be clobbered. This is the fix that makes the entitlement seam and storage registry below actually pluggable. **Deploy note:** regenerate the precompiled container (`php glueful di:container:compile --force`) — an artifact compiled before 1.54.0 still encodes the old precedence.
::

::card
#title
Entitlement seam (`Glueful\Entitlements`) — contract only
#description
A new core extension point for **commercial capability gates**: `EntitlementCheckerInterface` (`allows()` / `limit()`, explicit tenant uuid) with an absent-allow `NullEntitlementChecker` default bound in `CoreProvider`. Entitlements are paywall gates, not security boundaries — absent must never lock an app out (the opposite of authorization, which fails closed). Core ships the contract only: no consumer, no tenant/plan awareness. The forthcoming `glueful/subscriptions` binds the real checker over the default and provides the first consumer (entitlement-driven rate-limit tiers).
::

::card
#title
Storage driver registry + provider packs (breaking)
#description
Disk drivers now resolve through a registry: `StorageDriverFactoryInterface` (identity, construction, `available()`, `features()`) with optional `NativeSignedUrlProviderInterface` / `StorageHealthCheckInterface` capability contracts, registered via the `storage.driver_factory` container tag. **Core keeps only `local`/`memory`** — `s3`/`gcs`/`azure` are extracted to first-party packs; a missing driver fails fast with an exception naming the package to install. Also new: `storage:test [disk]` diagnostics (read-only by default, `--write` opt-in, never prints secrets) and an optional, default-off, visibility-scoped `native_url` field in the blob API for direct provider URLs.
::

### Migration Notes

- **Cloud storage disks need their provider pack**: `composer require glueful/storage-s3` for `s3` disks (its presets cover R2, MinIO, Spaces, Wasabi). `gcs`/`azure` users should hold the upgrade until those packs publish (following shortly). `local`/`memory`-only apps need nothing.
- **On deploy:** `php glueful commands:cache` (new `storage:test` command) and `php glueful di:container:compile --force` (the precedence fix only takes effect in a freshly compiled container).
- **Extension authors:** your `services()` definitions now genuinely override core defaults for the same id (previously dropped silently). Audit for unintentional core-id collisions.
- Optional env: `UPLOADS_NATIVE_MAX_PRIVATE_TTL` (default 900). No core migrations; no required env changes.

```bash
composer update glueful/framework
composer require glueful/storage-s3   # only if a disk uses driver: s3 / R2 / MinIO / Spaces / Wasabi
```

## v1.53.0 - Nunki
**Released: June 8, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-plug-connected"}
#description
A backward-compatible release that adds two **generic, chainable database extension seams** — so extensions can enforce scopes, narrow queries, or veto statements without patching core — and folds in **four bug fixes** uncovered while building the upcoming `glueful/tenancy` extension. Both seams are no-ops on a plain install (zero behavior change). No env vars, no migrations, no breaking changes; `composer update glueful/framework` suffices.
::

### Key Highlights

::card
#title
Chainable DB Extension Seams (interceptors + table hooks)
#description
`QueryExecutor::addQueryInterceptor()` registers **pre-execution** interceptors that run before every statement and may **throw to veto** it — suitable for enforcement (access/scope guards, read-only modes, SQL allow/deny policies), unlike the existing post-execution query log which only observes. `Connection::addTableHook()` decorates the `QueryBuilder` returned by `Connection::table()`, keyed by table name — for auto-applying scopes/columns/conditions to **raw** query-builder access (raw-level soft-deletes, org/tenant scoping, environment filtering). Both seams are **chainable**: every registration runs in order (no last-writer-wins), and both are inert when nothing is registered.
::

::card
#title
Four Bug Fixes (queue deserialization, write-path, container)
#description
**SecureSerializer:** namespace-wildcard allowlist entries (e.g. `Glueful\Queue\Jobs\*`) are now actually honored — worker-side `Job::unserialize()` was broken for those classes — and `C:` (Serializable) tokens are now allowlist-validated. **Query builder:** a table-qualified WHERE column on a write (`->where('t.col', $v)->update([...])` / `->delete()`) no longer throws `InvalidArgumentException` — an incomplete identifier-unwrap left a stray quote the column validator rejected (SELECT was unaffected). **Container:** `Connection::class` now resolves from the DI container (it was bound only as `'database'`), so the documented `db($ctx)` and `app($ctx, Connection::class)` accessors work out of the box instead of throwing "Service not found".
::

### Migration Notes

- **No action required.** `composer update glueful/framework` picks up 1.53.0. No new env vars, no migrations, no API breaks; the seams are opt-in and inert unless an extension registers a hook.
- The api-skeleton `^1.52.0` constraint already permits 1.53.0 — no skeleton changes ship in this release.

```bash
composer update glueful/framework
```

---

## v1.52.0 - Mizar
**Released: June 7, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-package-export"}
#description
A coordinated breaking release that makes **core lean**: four subsystems move out of the framework into standalone, opt-in `glueful/*` extensions, each behind a narrow seam core consumes only if bound. **Archive** → `glueful/archive`, **CDN / edge-cache** → `glueful/cdn`, **queue operations** (supervision / autoscaling / worker-metrics) → `glueful/queue-ops`, and **rich media** (image processing / thumbnails / metadata) → `glueful/media`. A plain core install boots, serves uploads, runs a lean single-worker `queue:work`, and caches responses with **none** of these subsystems' heavy dependencies present — `intervention/image` and `james-heinrich/getid3` are removed from core. Every subsystem is restored with a single `composer require`. See the migration notes.
::

### Key Highlights

::card
#title
Archive & CDN / Edge-Cache Extracted (seam-backed)
#description
`glueful/archive` now owns the generic table-archive product (`ArchiveService`, `archive:manage`, the archive schema + the `ARCHIVE_DATABASE_SCHEMA` gate) — core had no consumer of it. `glueful/cdn` owns edge purging, cache-control headers, the provider adapters, and `cache:purge`; core keeps only the `Glueful\Cache\Contracts\EdgeCacheInterface` seam bound by default to the no-op `NullEdgeCache`, so `ResponseCachingTrait` keeps emitting surrogate keys with or without the extension. Restore with `composer require glueful/archive` / `composer require glueful/cdn`.
::

::card
#title
Queue Ops Extracted; Core Ships a Lean Worker
#description
The supervised-fleet surface (`Process/*`, `WorkerMonitor`, `queue:autoscale`, and the old `queue:work` sub-actions `spawn`/`scale`/`status`/`stop`/`restart`/`health`) moves to `glueful/queue-ops`, restoring `queue:supervise` + `queue:autoscale`. Core gains a lean single-loop `QueueWorker`: plain `php glueful queue:work` runs one worker and resolves the `WorkerMonitorInterface` seam to a no-op `NullWorkerMonitor`. New additive flags ship in core regardless — `queue:work --once` / `--connection=`, and `WorkerOptions` now treats `max-jobs`/`max-runtime` `0` as **unlimited**. The `queue.workers.*` ops config relocates to the extension's `queue_ops.*` (same env vars); core keeps per-queue `priority`/`memory_limit`/`timeout`/`max_jobs`, `queue.workers.performance.*`, and `queue.monitoring.*`.
::

::card
#title
Rich Media Extracted; Uploads Stay in Core
#description
Image processing, thumbnail generation, and media-metadata extraction move to `glueful/media`, along with the two heavy deps (`intervention/image`, `james-heinrich/getid3`). Core keeps the upload pipeline — `FileUploader`, the `Glueful\Uploader\Contracts\MediaProcessorInterface` seam, and the unchanged `MediaMetadata` value object. Without the extension, uploads still succeed: `uploadMedia()` returns `thumb_url: null` + a type-only `MediaMetadata`, and the blob-resize endpoint serves the original image (returning `415` only on an explicit format conversion). The `image()` helper and `config/image.php` are now extension-provided. Restore with `composer require glueful/media`.
::

### Migration Notes

- **Restore any subsystem with one `composer require`** (auto-discovered via `extra.glueful`): `glueful/archive`, `glueful/cdn`, `glueful/queue-ops`, `glueful/media`. Run `php glueful migrate:run` for those that ship schema (archive).
- **Refresh the production command manifest on deploy.** This release removes the core `archive:manage`, `cache:purge`, and `queue:autoscale` commands; a `storage/cache/glueful_commands_manifest.php` generated before the upgrade still references them and breaks CLI boot. Run `php glueful commands:cache --clear` — `php glueful cache:clear` does **not** clear the command manifest.
- **No-extension behavior is graceful, not fatal.** Seams degrade to no-ops/defaults: `NullEdgeCache` (response caching still emits surrogate keys), lean `queue:work`, type-only media metadata + original-served variants. Removed helpers/commands (`image()`, `queue:autoscale`, the `queue:work` sub-actions) are *absent* (function/command-not-found), not error-printing stubs.
- **Namespace maps** (when restoring an extension and updating app code): `Glueful\Services\ImageProcessor` → `Glueful\Extensions\Media\ImageProcessor`; `Glueful\Cache\EdgeCacheService` → `Glueful\Extensions\Cdn\EdgeCachePurger`; `Glueful\Queue\Monitoring\WorkerMonitor` → `Glueful\Extensions\QueueOps\Monitoring\WorkerMonitor`; `Glueful\Services\Archive\*` → `Glueful\Extensions\Archive\*`. Full maps in the framework `UPGRADE.md`.
- **No new framework env vars, no core migrations.** The api-skeleton is bumped to `^1.52.0` and ships **lean** (extensions are opt-in; its published `config/image.php`, `cache.edge`, `queue.workers.*` ops blocks, and `capabilities.archive` were removed).

```bash
composer update glueful/framework
# then, to restore what you use:
composer require glueful/media glueful/queue-ops glueful/cdn glueful/archive
php glueful commands:cache --clear
```

---

## v1.51.0 - Larawag
**Released: June 6, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bell-ringing"}
#description
A five-part refinement of the core notification subsystem. The framework now ships a real in-app **`database`** channel (the default `['database']` channel resolves end-to-end instead of failing as `channel_not_found`), validates channels at **dispatch** rather than construction, makes persistence **optional and safe** (`NOTIFICATIONS_DATABASE_STORE=false`), abstracts **async queue dispatch** behind an injectable seam, adds **structured channel results** (`NotificationResult`), and routes all channel registration through one **extension `boot()`** path. Mostly additive — but two deliberate breaking changes land in channel registration/dispatch. See the migration notes.
::

### Key Highlights

::card
#title
Real `database` Channel + Dispatch-Time Validation
#description
`Glueful\Notifications\Channels\DatabaseChannel` is registered by default in `NotificationsProvider`, so the framework's default `['database']` channel resolves end-to-end instead of failing as `channel_not_found`. It is an in-app *acknowledge* channel — it performs no writes of its own (the notification and its delivery records stay owned by `NotificationService`), and its availability tracks the `notifications` persistence capability. Channel validation also moves from construction to dispatch: `NotificationService` no longer rejects `default_channels` against a hardcoded list — names are normalized structurally only (trimmed, de-duplicated, non-empty, **case preserved**), and unknown channels surface at dispatch via the registry's existing `channel_not_found` / `channel_unavailable`. One source of truth (the `ChannelManager` registry); custom channels work without core changes.
::

::card
#title
Optional, Safe Persistence + Injectable Async Queue
#description
A new `NotificationStoreInterface` abstracts the store; `NotificationRepository` implements it (existing callers unaffected), and a `NullNotificationStore` binds instead when the `notifications` capability is off. The null store degrades explicitly — reads return empty/null/zero, transient writes no-op, and durability-implying operations (`savePreference`, `markAllAsRead`, `deleteOldNotifications`, scheduling, retries) throw `NotificationPersistenceDisabledException` rather than silently losing state. In parallel, `NotificationQueueDispatcherInterface` (default `QueueManagerNotificationDispatcher`) abstracts async dispatch so `send()` never requires a queue and queueing stays unit-testable.
::

::card
#title
Structured Results + Extension-Driven Registration
#description
Channels may opt into a richer `sendNotification(): NotificationResult` (provider message id, error code/message, retryability, latency) via the new `RichNotificationChannel` interface; the dispatcher prefers it and falls back to adapting legacy `send(): bool`, so `NotificationChannel::send()` is unchanged. And channels/`NotificationExtension` hooks now register through an extension's `ServiceProvider::boot()` via `registerNotificationChannel()` / `registerNotificationExtension()` into the shared container `ChannelManager`/dispatcher — one path, no per-job glue. `registerChannel()` is idempotent for the same class and throws `ChannelAlreadyRegisteredException` when a *different* class claims a registered name; `replaceChannel()` overrides intentionally.
::

### Migration Notes

- **Breaking: `ChannelManager` channel-name methods renamed (no aliases).** Replace `getAvailableChannels()` with `getRegisteredChannelNames()`; for only the currently-available channels' names, use the new `getActiveChannelNames()`. `getActiveChannels()` (returning channel objects) is unchanged.
- **Breaking: notification jobs/commands require an `ApplicationContext`.** `DispatchNotificationChannels`, `SendNotification`, `ProcessRetriesCommand`, and `NotificationRetryTask` resolve the shared container dispatcher and throw `NotificationContextRequiredException` if constructed without a context — they no longer build ad-hoc managers or hardcode the `EmailNotification` provider. The queue worker and console kernel already provide a context.
- **Channel packages register from `boot()`.** Custom or not-yet-migrated channel extensions must register their channel/hooks via the new `registerNotificationChannel()` / `registerNotificationExtension()` helpers; until they do, that channel won't auto-wire into the shared dispatcher used by the async jobs.
- **Retry config key moved** from the `emailnotification` namespace to channel-agnostic `notifications.retry` (built-in defaults otherwise).
- **No new env vars, no migrations.** The `notifications` capability default stays `true`; set `NOTIFICATIONS_DATABASE_STORE=false` to run without a database store.

```bash
composer update glueful/framework
```

---

## v1.50.2 - Kochab
**Released: June 5, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-file-text"}
#description
Route docblocks can now document query parameters with an editor-clean **`@queryParam name:type="…"`** tag that the OpenAPI generator actually parses. The old approach overloaded the reserved `@param` tag (`@param page query integer false "…"`), which IDEs/Intelephense mis-read as undefined PHPDoc types (P1133 warnings). A latent doc-gen bug is also fixed: routes that declared a query parameter alongside a `{id}` path segment silently lost the path parameter from their spec. Framework-only — no env vars, no migrations, no API breaks.
::

### Key Highlights

- **`@queryParam` route-doc tag.** `CommentsDocGenerator` parses `@queryParam name:type="description" [{required}]` as an `in: query` OpenAPI parameter — no more reserved-`@param` false positives in your editor. The legacy positional `@param … query …` form still parses, so existing route docblocks are unaffected.
- **Path params no longer dropped.** URL `{name}` path parameters were auto-derived only when *no* parameters were documented at all; a route with a query param plus a `{id}` lost its path param from the generated spec. Path params are now always derived from the URL and merged with documented params (de-duplicated by name; an explicit docblock still wins).
- **`routes/resource.php` migrated** to `@queryParam` for the `/data/{table}` list endpoint's `page`/`limit`/`sort`/`order` params (they now actually appear in the spec).

### Migration Notes

`composer update glueful/framework` is sufficient — the api-skeleton `^1.50.1` constraint already permits 1.50.2. No action required; the new tag is opt-in and the legacy `@param` form continues to work.

---

## v1.50.1 - Kochab
**Released: June 5, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-bug"}
#description
Two extension points that silently did nothing are now fixed. **`ServiceProvider::mergeConfig()`** delegated to a `config.manager` service that was never registered, so an extension's `config/*.php` defaults never reached `config()` — every first-party extension ran on empty/hardcoded fallbacks unless the app shipped its own copy. And **`LoginResponseBuildingEvent`** listeners' changes were discarded by the login-response shaper. Both now work as documented. Framework-only: no env vars, no migrations, no API breaks.
::

### Key Highlights

- **`mergeConfig()` actually merges now.** Backed by the new `ApplicationContext::mergeConfigDefaults()`, extension config defaults are merged **under** framework/app/env config files (your app's `config/*.php` still wins) and persist across `clearConfigCache()`. Affected extensions: `glueful/aegis`, `conversa`, `email-notification`, `entrada`, `meilisearch`, `notiva`, `payvia`, `runiva`.
- **`LoginResponseBuildingEvent` listeners affect the response.** `LoginResponseShaper::shape()` now reads `$event->getResponse()` back, so a listener can add fields (e.g. organization/department context) to the login response.

### Migration Notes

`composer update glueful/framework` is sufficient — the api-skeleton `^1.50.0` constraint already permits 1.50.1. **Behavioral note:** enabled first-party extensions now receive their declared config defaults (previously ignored); review those defaults if you relied on the prior empty behavior.

---

## v1.50.0 - Kochab
**Released: June 4, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-user-shield"}
#description
The concrete user store is extracted to the first-party `glueful/users` extension, leaving a **provider-agnostic core** that talks to identity through `UserProviderInterface` + the canonical `UserIdentity`. In parallel, the framework now **owns the database schema for its own subsystems** — the auth security spine plus DB-backed platform capabilities (queue, scheduler, notifications, metrics, locks, uploads, archive) — as first-class, config-gated, source-tracked migrations, replacing lazy runtime DDL. **Breaking** (shipped as a minor per the pre-public policy): apps must enable a user store. See the migration notes.
::

### Key Highlights

::card
#title
Provider-Agnostic Identity
#description
The concrete user store — `User`, `UserRepository`, the in-core `UserProvider`, account/2FA/password-reset, and `EmailVerification` — moves to the first-party `glueful/users` extension. Core keeps the security spine and depends only on contracts: `UserProviderInterface` (lookup + credential verification) returning the canonical, immutable `UserIdentity`, with `IdentityResolver` applying the account-status gate and folding in claims providers (the `identity.claims_provider` tag — how RBAC like `glueful/aegis` adds roles). With no store installed, core binds a fail-closed `NullUserProvider` and authentication is disabled by design. `AuthenticatedUser` is retired in favour of `UserIdentity`; 2FA becomes an optional capability behind `TwoFactorServiceInterface`.
::

::card
#title
Core Owns Its Schema
#description
The framework ships first-class migrations under `framework/migrations/<capability>/` for the tables its own code reads and writes — auth (`auth_sessions`/`auth_refresh_tokens`/`api_keys`, always on) plus `uploads`, `queue`, `scheduler`, `notifications` (including the formerly runtime-only `notification_retry_queue`), `metrics`, `locks`, and `archive`. Each capability is **registered only when its config gate is on**, under its own source `glueful/framework:<capability>`, via `config/capabilities.php` and existing driver config. The lazy `ensure*Table*()` runtime DDL is removed from `DatabaseQueue`, `JobScheduler`, `NotificationRetryService`, and `ApiMetricsService` — schema now comes from `migrate:run`, not request-time DDL.
::

::card
#title
Ordered, Package-Scoped Migrations
#description
`MigrationPriority` tiers (`FOUNDATION`/`IDENTITY`/`DEFAULT`/`DEPENDENT`) and a `source` column on the `migrations` table let core, extensions, and the app contribute one ordered stream — two packages can ship the same filename without conflict, and pending order is deterministic via `(priority, basename, source)`. Plus a declarative permission catalog (`permissions:list`/`diff`/`sync`) and column-aware soft-delete (`QueryBuilder::delete()` only soft-deletes tables that have `deleted_at`).
::

### Migration Notes

- **Breaking: enable a user store.** Core no longer ships `Glueful\Models\User` / `Glueful\Repository\UserRepository`, and `AuthenticatedUser` is removed. Install and enable `glueful/users` (the api-skeleton does so by default). Without a store, auth fails closed. See [`docs/IDENTITY.md`](https://github.com/glueful/framework/blob/main/docs/IDENTITY.md).
- **`api_keys.user_id` → `user_uuid`.** The column (and `ApiKeyService` input / `ApiKey` model field) is renamed; it remains an indexed UUID with no FK.
- **Schema is migration-owned.** Run `php glueful migrate:run`; capability tables install per `config/capabilities.php` + driver config (`queue.default`, `lock.default`, `uploads.enabled`). See [`docs/MIGRATIONS_AND_CAPABILITIES.md`](https://github.com/glueful/framework/blob/main/docs/MIGRATIONS_AND_CAPABILITIES.md).

```bash
composer require glueful/users
php glueful migrate:run
```


---

Older releases (**v1.49.1 and earlier**) live in the [Release Archive](/releases-archive). The version table at the top links every release; for the full machine-readable history see the [CHANGELOG](https://github.com/glueful/framework/blob/main/CHANGELOG.md).
