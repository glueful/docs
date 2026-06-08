# Glueful Docs Consolidation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the duplication between the concept docs (`2.essentials/`, `3.features/`, `4.advanced/`, `5.deployment/`) and the parallel `6.cookbook/` section, fold genuinely-unique recipes upward, fix a set of user-facing accuracy bugs, and tame two oversized pages (`releases.md`, `6.cookbook/4.error-handling.md`).

**Architecture:** The Nuxt Content site auto-generates its sidebar from the `content/` tree via `queryCollectionNavigation` — there is **no manual nav file**. Deleting or renaming a `.md` updates the sidebar automatically. Page routes are the file path minus the numeric ordering prefix (e.g. `content/6.cookbook/9.validation.md` → `/cookbook/validation`; `content/2.essentials/7.validation.md` → `/essentials/validation`). Therefore the only manual maintenance on each deletion is **repointing internal cross-links** to the surviving canonical page. Each task is self-contained: merge unique content up, delete/trim the duplicate, repoint links, render-check, commit.

**Tech Stack:** Nuxt 3 + Nuxt Content (`@nuxt/content`) + Nuxt UI v3 (Tailwind v4), MDC markdown. Repo: `/Users/michaeltawiahsowah/Sites/glueful/docs`. Dev/build: `pnpm dev` / `pnpm build`.

**Working rules:**
- Work on the docs repo's current branch (match the framework convention: commit directly on the working branch, no feature branch).
- **Do not** add `Co-Authored-By` trailers.
- One topic per commit. Commit message form: `docs: consolidate <topic> (cookbook → <canonical>)`.
- **Link audit before every delete/rename — use `rg`, not `grep`, and match the route *stem* (no leading slash) so relative links, absolute links, and MDC `:link`/`[text](...)` variants are all caught.** Example for the `validation` route:
  ```bash
  rg -n "cookbook/validation" content/
  ```
  (The stem `cookbook/validation` is a substring of both `/cookbook/validation` and `../cookbook/validation`, so one pattern covers all forms.) A deletion that leaves a dangling `cookbook/...` link is a task failure.
- **`content/6.cookbook/index.md` is the hand-written cookbook landing page and links to most routes this plan deletes/renames.** It is NOT auto-generated. Every delete/rename task, and any trim that changes the cookbook page title/label, lists it as a touched file — on each, update or remove its entry for the affected page. (Pure trim-in-place tasks that keep the route and label — e.g. routing, middleware, caching, queues, notifications, performance in Phase 2 — leave the index untouched.) Do not rely on the route grep alone to remember it.
- **Verification is content-only: `pnpm build` is the gate.** `pnpm lint` / typecheck are NOT required for markdown-only changes and should not be run unless a task explicitly says so. "Render-check" = `pnpm dev`, open the affected page(s) + sidebar, confirm no broken MDC component, no 404 in nav, no empty page; for fence/structure fixes confirm the previously-ejected sections now render in the page body.
- **Phase gate:** run `pnpm build` at the end of Phase 0, Phase 1, and Phase 2 (not only at the very end) — see the "Phase N checkpoint" task closing each phase. This catches a broken MDC/fence within a few commits instead of 20 commits later.

---

## Phase 0 — Accuracy quick-wins (independent; do first)

These are user-facing defects that exist regardless of the restructure. They are small and safe. Do them before any merge so the canonical pages are correct *before* content folds into them.

### Task 0.1: Fix broken markdown fences in `4.advanced/`

**Files:**
- Modify: `content/4.advanced/configuration.md` (~L260)
- Modify: `content/4.advanced/middleware.md` (~L298)

- [ ] **Step 1:** Open `configuration.md`. Around L260 there is a stray closing ```` ``` ```` that swallows "Configuration Loading", "Cross-References" and a duplicated "Configuration Files" `##` heading into a code block. Locate the unbalanced fence (count ```` ``` ```` openings vs closings from the top of the section) and remove/relocate the stray fence so those sections render as normal prose. Also delete the duplicated "Configuration Files" `##` heading.
- [ ] **Step 2:** Open `middleware.md`. Around L298 a stray ```` ``` ```` ejects "Terminating Middleware", "Testing Middleware", and "Best Practices" out of the page body. Fix the fence balance so those sections render.
- [ ] **Step 3:** Render-check both pages in `pnpm dev` — confirm the previously-hidden sections now appear as headings + prose, not inside a code block.
- [ ] **Step 4:** Commit.

```bash
git add content/4.advanced/configuration.md content/4.advanced/middleware.md
git commit -m "docs: fix broken code fences hiding sections in advanced/configuration + middleware"
```

### Task 0.2: Fix contradictory CORS config in `3.features/cors-csrf.md`

**Files:**
- Modify: `content/3.features/cors-csrf.md` (L23–48 and L344–349)

- [ ] **Step 1:** Compare the two CORS config blocks. L23–48 uses `allowed_origins` as an **array** plus `allow_credentials`. L344–349 ("Common Scenarios") uses `allowed_origins` as a **string** plus `supports_credentials`. Determine the correct shape by checking the framework's actual CORS config: read `/Users/michaeltawiahsowah/Sites/glueful/framework/config/` for the cors config (or `src/` CORS middleware) to confirm the real key names (`allowed_origins` type, `allow_credentials` vs `supports_credentials`).
- [ ] **Step 2:** Rewrite the L344–349 block to match the verified canonical shape from Step 1. Remove the contradicting variant.
- [ ] **Step 3:** Render-check; commit.

```bash
git add content/3.features/cors-csrf.md
git commit -m "docs: reconcile contradictory CORS config shapes in cors-csrf"
```

### Task 0.3: Replace the AES-CBC `Encryptor` example with the real `EncryptionService`

**Files:**
- Modify: `content/5.deployment/security-hardening.md`

- [ ] **Step 1:** Find the hand-rolled `Encryptor` class example (AES-CBC). The framework ships `Glueful\Encryption\EncryptionService` (AES-256-GCM). Verify its API by reading `/Users/michaeltawiahsowah/Sites/glueful/framework/src/Encryption/EncryptionService.php` (methods: `encrypt`/`decrypt`/`encryptBinary`/`decryptBinary`/`encryptFile`/`decryptFile`, AAD support).
- [ ] **Step 2:** Replace the AES-CBC example with a `EncryptionService` usage snippet resolved via `app($context, EncryptionService::class)`, matching the framework CLAUDE.md "Encryption Service" examples.
- [ ] **Step 3:** Render-check; commit.

```bash
git add content/5.deployment/security-hardening.md
git commit -m "docs: replace hand-rolled AES-CBC example with real EncryptionService (AES-256-GCM)"
```

### Task 0.4: Fix stale static facades in `3.features/scheduling.md`

**Files:**
- Modify: `content/3.features/scheduling.md` (~L229, L288, L318)

- [ ] **Step 1:** Replace the Laravel-style static facade calls — `Notifications::send(...)`, `Storage::cleanupOldFiles()`, `Storage::disk('s3')` — with the framework's context-first idiom. Resolve services via `app($context, ...)` (e.g. the notification service / storage manager). Verify the real service classes in the framework `src/` before naming them; if a clean equivalent doesn't exist for an example, simplify the example to one that uses a verified API.
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/3.features/scheduling.md
git commit -m "docs: replace stale static facades with context-first calls in scheduling"
```

### Task 0.5: Fix out-of-scope `$context` in `4.advanced/` snippets

**Files:**
- Modify: `content/4.advanced/dependency-injection.md`, `content/4.advanced/middleware.md`, `content/4.advanced/service-providers.md`, `content/4.advanced/testing.md`

- [ ] **Step 1:** In each file, find standalone snippets that reference `$context` (or call `app($context, ...)` / `config($context, ...)`) where `$context` is not a parameter in scope. In service-provider `defs()`/factory closures the correct accessor is `$this->getContext()` (the files already use this correctly elsewhere — make them consistent). In middleware `handle()` the `Request $request` is in scope, not `$context`. Fix each snippet to use an in-scope source or add the missing parameter.
- [ ] **Step 2:** Render-check all four; commit.

```bash
git add content/4.advanced/dependency-injection.md content/4.advanced/middleware.md content/4.advanced/service-providers.md content/4.advanced/testing.md
git commit -m "docs: fix out-of-scope \$context in advanced snippets"
```

### Task 0.6: Reconcile the notifications API + install package name

**Files:**
- Modify: `content/3.features/notifications.md` (L12 install line, send API)
- Reference (do not edit yet): `content/6.cookbook/13.notifications.md`

- [ ] **Step 1:** The feature page and the cookbook teach two different send APIs and two different install package names (`glueful/extensions-email-notification` vs an `email_notification` extension key). Verify the real package/extension name and the real send API by checking the framework / api-skeleton (`config/extensions.php`, the notifications service in `src/`). Pick the verified canonical API + package name.
- [ ] **Step 2:** Make `3.features/notifications.md` correct and canonical (it is the entry point). Leave `6.cookbook/13` for Phase 2 (it will be trimmed to channel/template internals there) — but if its install line is wrong, fix that line now too.
- [ ] **Step 3:** Render-check; commit.

```bash
git add content/3.features/notifications.md content/6.cookbook/13.notifications.md
git commit -m "docs: reconcile notifications send API + install package name"
```

### Task 0.7: Fix the inconsistent Hello-World sample in getting-started

**Files:**
- Modify: `content/1.getting-started/index.md` (Quick Start block, ~L30–72)

- [ ] **Step 1:** The index's sample uses a root `/hello` route returning `new Response([...])`, contradicting every other page (versioned `v1` group + `Response::success()`). Replace the inline sample to match `content/1.getting-started/2.quickstart.md` (same route style + `Response::success()`), OR trim the duplicated install/quickstart blocks down to pointers to `1.installation.md` / `2.quickstart.md` and keep only "What is Glueful / When to Use / Core Features / FAQ".
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/1.getting-started/index.md
git commit -m "docs: align getting-started index Hello-World with quickstart"
```

### Task 0.8: Phase 0 checkpoint — `pnpm build`

- [ ] **Step 1:** Run the content gate. No lint/typecheck — content-only.

```bash
pnpm build
```
Expected: build succeeds, no Nuxt Content parse errors, no broken-MDC warnings. The Phase 0 fence fixes (Tasks 0.1) are the main risk — confirm the previously-ejected sections render. If the build fails, fix before starting Phase 1.

---

## Phase 1 — Bucket ①: merge pure duplicates, then delete

Each task: lift the small unique remainder from the cookbook page into its canonical concept page, repoint all links, delete the cookbook page, render-check, commit. **Order within a task matters: merge content first, repoint links, delete last.**

### Task 1.1: validation — `6.cookbook/9.validation.md` → `2.essentials/7.validation.md`

**Files:**
- Modify: `content/2.essentials/7.validation.md`
- Modify: `content/6.cookbook/index.md` (remove the validation entry)
- Delete: `content/6.cookbook/9.validation.md`

- [ ] **Step 1:** Read both. The cookbook's only non-duplicate value vs essentials is: (a) the **sanitization-ops** list, and (b) any built-in rule detail not already in essentials. Append those to `7.validation.md` (the essentials page is canonical because it already leads with `validateRequest()` and documents the `ValidationException` shape, which the cookbook lacks).
- [ ] **Step 2:** Repoint links. Find references to the old route (stem catches all forms):

```bash
rg -n "cookbook/validation" content/
```
Repoint each to `/essentials/validation`, **including the entry in `content/6.cookbook/index.md`** (remove it).
- [ ] **Step 3:** Delete `content/6.cookbook/9.validation.md`.
- [ ] **Step 4:** Render-check: `/essentials/validation` shows the merged content; `/cookbook/validation` is gone from the sidebar and the cookbook index; no dangling links. Commit.

```bash
git add -A content/
git commit -m "docs: consolidate validation (cookbook → essentials/validation)"
```

### Task 1.2: events — `6.cookbook/12.events.md` → `3.features/events.md`

**Files:**
- Modify: `content/3.features/events.md`
- Modify: `content/6.cookbook/index.md` (remove the events entry)
- Delete: `content/6.cookbook/12.events.md`

- [ ] **Step 1:** The cookbook page is a strict subset except for its "when to use events vs direct calls" framing. Fold that framing into `3.features/events.md` (near its intro/Common Patterns). **Caution:** `3.features/events.md` itself has suspect content (a "built-in framework events" catalog: `CacheHitEvent`, `QueryExecutedEvent`, `RequestEvent`, `ResponseEvent`, `SessionCreatedEvent`, and a `config/events.php` `'listeners'` shape). Verify each against the framework before trusting it: `rg -n "class .*Event" /Users/michaeltawiahsowah/Sites/glueful/framework/src/Events/` and check the real listener-registration mechanism. **Delete or correct** any event/config shape that doesn't exist. (This folds Task-level accuracy work into the merge since the canonical page must be correct.)
- [ ] **Step 2:** `rg -n "cookbook/events" content/` → repoint to `/features/events`, **including the `content/6.cookbook/index.md` entry**.
- [ ] **Step 3:** Delete `content/6.cookbook/12.events.md`. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: consolidate events (cookbook → features/events) + drop unverified built-in events"
```

### Task 1.3: DI & services — `6.cookbook/3.di-and-services.md` → `4.advanced/dependency-injection.md`

**Files:**
- Modify: `content/4.advanced/dependency-injection.md`
- Modify: `content/6.cookbook/index.md` (remove the di-and-services entry)
- Delete: `content/6.cookbook/3.di-and-services.md`

- [ ] **Step 1:** The cookbook page is the *more accurate* one on three points: the **`services()` array DSL cheatsheet**, **tags / lazy-warmup**, and the **container-compilation CLI** (`di:container:*`). The advanced page is longer but uses the older `defs()` idiom and repeats the `AppServiceProvider` example ~3×. Reconcile into ONE canonical page at `4.advanced/dependency-injection.md`: adopt the cookbook's `services()` DSL + tags + compilation CLI as the primary idiom, collapse the triplicated `AppServiceProvider` example to one, and keep the typed-`Definition` form only as a secondary note if still valid (verify against `/Users/michaeltawiahsowah/Sites/glueful/framework/src/Container/`).
- [ ] **Step 2:** `rg -n "cookbook/di-and-services" content/` → repoint to `/advanced/dependency-injection`, **including the `content/6.cookbook/index.md` entry**.
- [ ] **Step 3:** Delete the cookbook page. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: consolidate DI (cookbook services() DSL → advanced/dependency-injection)"
```

### Task 1.4: file-uploads (core flow) — `6.cookbook/14.file-uploads.md` → `3.features/file-uploads.md`

**Files:**
- Modify: `content/3.features/file-uploads.md`
- Modify: `content/6.cookbook/index.md` (remove the file-uploads entry)
- Delete: `content/6.cookbook/14.file-uploads.md`

- [ ] **Step 1:** Fold the cookbook's unique utilities into the feature page: **base64 uploads**, `getDirectoryStats` / `cleanupOldFiles`, `calculateChecksum`, and signed-URL-via-uploader. (Storage backends and image/media stay in `15.storage.md` and `16.image-processing.md` — do NOT pull those in; see Task 2.x where `3.features/file-uploads.md` is itself trimmed to delegate to them.)
- [ ] **Step 2:** `rg -n "cookbook/file-uploads" content/` → repoint to `/features/file-uploads`, **including the `content/6.cookbook/index.md` entry**. (Note: the stem `cookbook/file-uploads` will not match the surviving `cookbook/storage` / `cookbook/image-processing` links — good.)
- [ ] **Step 3:** Delete the cookbook page. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: consolidate file-upload flow (cookbook → features/file-uploads)"
```

### Task 1.5: distributed locks — `6.cookbook/17.distributed-locks.md` → `3.features/distributed-locks.md`

**Files:**
- Modify: `content/3.features/distributed-locks.md`
- Modify: `content/6.cookbook/index.md` (remove the distributed-locks entry)
- Delete: `content/6.cookbook/17.distributed-locks.md`

- [ ] **Step 1:** Near-clone pair (414 L vs 458 L, same `LockManagerInterface` API). Fold the cookbook's distinct bits into the feature page: **lock-naming conventions**, **store-selection guidance**, **CLI/troubleshooting**. Preserve the feature page's "Monitoring" metrics list. Keep the queue-ops 1.52.0 extraction stamps (`queue:supervise`) intact.
- [ ] **Step 2:** `rg -n "cookbook/distributed-locks" content/` → repoint to `/features/distributed-locks`, **including the `content/6.cookbook/index.md` entry**.
- [ ] **Step 3:** Delete the cookbook page. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: consolidate distributed locks (cookbook → features/distributed-locks)"
```

### Task 1.6: testing — `6.cookbook/26.testing.md` → `4.advanced/testing.md`

**Files:**
- Modify: `content/4.advanced/testing.md`
- Modify: `content/6.cookbook/index.md` (remove the testing entry)
- Delete: `content/6.cookbook/26.testing.md`

- [ ] **Step 1:** The cookbook page (146 L) is the *accurate but thin* one — it correctly describes `tests/bootstrap.php`, the `:memory:` sqlite env, and the real `$this->get()` / `$this->app()` helpers. The advanced page (547 L) is richer but partly wrong (undefined `$context`, unverified `Connection('sqlite::memory:')` constructor, `$router->dispatch()`). Make `4.advanced/testing.md` canonical by: importing the cookbook's accurate bootstrap/helper descriptions, and **correcting or deleting** the advanced page's wrong snippets (verify against `/Users/michaeltawiahsowah/Sites/glueful/framework/tests/`). Drop the cookbook's "Pending Implementation / Planned Enhancements" disclaimer framing.
- [ ] **Step 2:** `rg -n "cookbook/testing" content/` → repoint to `/advanced/testing`, **including the `content/6.cookbook/index.md` entry**.
- [ ] **Step 3:** Delete the cookbook page. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: consolidate testing (cookbook accuracy → advanced/testing)"
```

### Task 1.7: console commands — `6.cookbook/23.console-commands.md` → `8.cli-reference.md` (+ keep custom-command recipe)

**Files:**
- Modify: `content/8.cli-reference.md`
- Modify: `content/6.cookbook/23.console-commands.md`
- Modify: `content/6.cookbook/index.md` (retitle the console-commands entry → "Writing Console Commands")

This task **trims `23.console-commands.md` in place** (keeping its filename/number so the route `/cookbook/console-commands` is stable) — no file is created or deleted.

- [ ] **Step 1:** `8.cli-reference.md` (178 L) is the better-maintained canonical command catalog (it correctly flags the 1.52.0 extractions). The cookbook page (1,084 L) re-lists every command AND has one piece of unique value: **"writing custom commands" (BaseCommand, `#[AsCommand]`, registration)**. The plan keeps that custom-command material as a slim recipe and defers the catalog to `/cli-reference`.
- [ ] **Step 2:** Ensure `8.cli-reference.md` is the complete command catalog (it already is — add any command from the cookbook that's genuinely missing, but do NOT duplicate the catalog).
- [ ] **Step 3:** Reduce `content/6.cookbook/23.console-commands.md` in place to ONLY the custom-command-authoring recipe; retitle its frontmatter/H1 to "Writing Console Commands" and remove the entire command-catalog half (defer to `/cli-reference`). Add a cross-link from the recipe to `/cli-reference`. Update its entry label in `content/6.cookbook/index.md`.
- [ ] **Step 4:** `rg -n "cookbook/console-commands" content/` → audit: links meaning "the command list" repoint to `/cli-reference`; links meaning "how to write a command" stay on `/cookbook/console-commands`. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: console-commands cookbook → custom-command recipe; cli-reference is canonical catalog"
```

### Task 1.8: deployment overview — distribute `6.cookbook/24.deployment.md` into `5.deployment/*`

**Files:**
- Modify: `content/5.deployment/docker.md`, `content/5.deployment/production.md`, `content/5.deployment/zero-downtime.md` (as needed)
- Modify: `content/6.cookbook/index.md` (remove the deployment entry)
- Delete: `content/6.cookbook/24.deployment.md`

- [ ] **Step 1:** This 1,006 L page is a flattened second copy of the whole `5.deployment/` section (Docker, AWS/GCP/Azure, Nginx LB, blue-green/rolling/canary, rollback, OPcache). The `5.deployment/*` pages are the canonical deep references. For each topic in the cookbook page, check whether `5.deployment/*` already covers it; if the cookbook has a genuinely missing detail (e.g. a cloud-provider note not in `docker.md`/`production.md`), move just that detail into the right deployment page. Keep the **command-manifest deploy warning** (`commands:cache --clear`) — confirm it's present in `production.md`; if not, add it there.
- [ ] **Step 2:** `rg -n "cookbook/deployment" content/` → repoint to the most relevant `/deployment/*` page (default `/deployment` index), **including the `content/6.cookbook/index.md` entry**.
- [ ] **Step 3:** Delete the cookbook page. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: distribute cookbook/deployment into deployment/* and delete duplicate"
```

### Task 1.9: Phase 1 checkpoint — `pnpm build` + dangling-link sweep

- [ ] **Step 1:** Confirm every Phase 1 deleted route is fully repointed (these are the only routes deleted so far):

```bash
rg -n "cookbook/(validation|events|di-and-services|file-uploads|distributed-locks|testing|deployment)\b" content/
```
Expected: **zero** results. Any hit is a dangling link to a deleted page — repoint it (don't forget `content/6.cookbook/index.md`).
- [ ] **Step 2:** `pnpm build`. Expected: success, no 404s in prerendered nav, no parse errors. Fix before starting Phase 2.

---

## Phase 2 — Bucket ②: simplify bloated duplicators to advanced-only recipes

These cookbook pages stay (for now) but get cut 50–70% to contain **only** the genuinely advanced/infra material absent from their concept twin. The concept page is the entry point; the cookbook page becomes the deep recipe. Each task: identify the unique-keep set, delete the duplicated basics, add a "see also" link to the concept page, render-check, commit.

> Decision note for the reviewer: an alternative to "trim in place" is "move the kept recipes into `4.advanced/` and delete the cookbook file entirely." The plan trims in place to keep diffs small and routes stable; flag if you'd prefer full relocation.

### Task 2.1: `6.cookbook/1.routing.md` (782 → ~300 L)

**Files:** Modify `content/6.cookbook/1.routing.md`

- [ ] **Step 1:** Canonical basics live in `2.essentials/1.routing.md` (and it's *more current* — has OpenAPI docblock tags + `route:cache:status` the cookbook lacks). **Cut** the duplicated basics (HTTP verbs, params, constraints, groups, attributes, named routes). **Keep** the unique recipe layer: route precedence/tiering rules, closures-not-cached detail, the "Framework Endpoints Reference" (health/auth/resource route patterns), and performance/bucketing internals. Add "See `/essentials/routing` for fundamentals" at the top.
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/6.cookbook/1.routing.md
git commit -m "docs: trim cookbook/routing to advanced recipes (defer basics to essentials)"
```

### Task 2.2: `6.cookbook/2.middleware.md` (1,245 → ~400 L)

**Files:** Modify `content/6.cookbook/2.middleware.md`

- [ ] **Step 1:** `4.advanced/middleware.md` holds the correct built-in **alias table** (the cookbook's own alias list is stale — it lists `field_selection` twice and omits `require_scope`/`validate`/`conditional_cache`). **Cut** the cookbook's stale alias list and its last ~700 L of repetitive "Advanced Authentication Examples" (`new AuthMiddleware(...options...)` permutations: env-specific, multi-tenant, factory). **Keep** any genuinely distinct middleware-authoring recipe. Cross-link to `/advanced/middleware` for the alias catalog.
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/6.cookbook/2.middleware.md
git commit -m "docs: trim cookbook/middleware; drop stale alias list + repetitive auth permutations"
```

### Task 2.3: `6.cookbook/10.caching.md` (1,125 → ~300 L)

**Files:** Modify `content/6.cookbook/10.caching.md`

- [ ] **Step 1:** `3.features/caching.md` is the better teaching doc (when-to-cache, patterns, stampede, config, monitoring, troubleshooting). **Cut** the architecture diagrams, `CacheStore` interface dumps, and large config tables that duplicate features. **Keep** stampede-protection + tagging + edge-caching as advanced recipes. Verify no in-body `EdgeCacheService` usage contradicts the 1.52.0 cdn-extension extraction (the feature page omits it — match that).
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/6.cookbook/10.caching.md
git commit -m "docs: trim cookbook/caching to advanced recipes (defer basics to features)"
```

### Task 2.4: `6.cookbook/11.queues-and-jobs.md` (1,574 → ~600 L)

**Files:** Modify `content/6.cookbook/11.queues-and-jobs.md`

- [ ] **Step 1:** `3.features/queues-jobs.md` is the complete primer (this is the *best-differentiated* pair already). **Cut** the duplicated job-authoring basics + large config dumps. **Keep** the infra recipes: per-driver feature lists, Process Management, Auto-Scaling, Batch Processing, failed-job internals. Keep queue-ops extraction stamps.
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/6.cookbook/11.queues-and-jobs.md
git commit -m "docs: trim cookbook/queues to infra/ops recipes (defer basics to features)"
```

### Task 2.5: `6.cookbook/13.notifications.md` (1,055 → ~300 L)

**Files:** Modify `content/6.cookbook/13.notifications.md`

- [ ] **Step 1:** `3.features/notifications.md` (made canonical in Task 0.6) is the entry point. **Cut** architecture diagrams, core-component breakdowns, and the API-endpoint catalog that duplicate features. **Keep** the channel/template internals (~250 L). Ensure the send API + install package name match the canonical choice from Task 0.6 (no contradiction).
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/6.cookbook/13.notifications.md
git commit -m "docs: trim cookbook/notifications to channel/template internals"
```

### Task 2.6: `6.cookbook/7.logging.md` (699 → ~450 L) + merge `5.deployment/logging.md`

**Files:**
- Modify: `content/6.cookbook/7.logging.md`
- Modify: `content/5.deployment/logging.md`

- [ ] **Step 1:** `6.cookbook/7.logging.md` is the framework-accurate page (LogManager, framework-vs-app boundary, DB logging, query-perf logging). `5.deployment/logging.md` (642 L) duplicates config/best-practices AND injects **non-framework hand-rolled logger classes** (`LogtailLogger`, `ElasticsearchLogger`, `SecureLogger`, `AsyncLogger`, `BufferedLogger`) plus middleware that doesn't implement `RouteMiddleware`. **Delete the invented logger/middleware classes** from `5.deployment/logging.md`; keep only its genuinely-operational bits (logrotate, rotation config, centralized-logging *guidance*, sensitive-data scrubbing) and move those into `6.cookbook/7.logging.md` (or keep a slim ops-only `5.deployment/logging.md` that links to the cookbook as canonical). **Decision:** make `6.cookbook/7.logging.md` canonical for logging; reduce `5.deployment/logging.md` to an ops note + link, OR delete it and repoint. Pick one and note it in the commit.
- [ ] **Step 2:** Reconcile overlapping config/best-practices between the two so it appears once.
- [ ] **Step 3:** If `5.deployment/logging.md` is deleted: `rg -n "deployment/logging" content/` → repoint to `/cookbook/logging` (don't forget any nav/index references). Render-check; commit.

```bash
git add -A content/
git commit -m "docs: make cookbook/logging canonical; strip invented logger classes from deployment/logging"
```

### Task 2.7: `6.cookbook/21.performance.md` (1,533 → ~700 L) — strip re-embedded pages

**Files:**
- Modify: `content/6.cookbook/21.performance.md`

- [ ] **Step 1:** **Highest-value single trim.** This page literally re-embeds two other whole pages: a "Session Analytics Optimization" section (duplicate of `19.sessions-analytics.md`) and an "API Metrics System Performance" section (duplicate of `20.api-metrics.md`). **Delete both embedded sections** and replace each with a one-line link to `/cookbook/sessions-analytics` and `/cookbook/api-metrics`. **Keep** the query-cache / profiling / response-caching deep dives. Also fold in the one keep-worthy item from `4.advanced/performance.md` — its "Configuration Tuning" real config-key list (see Task 3.3).
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/6.cookbook/21.performance.md
git commit -m "docs: strip re-embedded session-analytics + api-metrics from cookbook/performance"
```

### Task 2.8: trim sprawl in `19.sessions-analytics.md` + `20.api-metrics.md`

**Files:**
- Modify: `content/6.cookbook/19.sessions-analytics.md` (1,107 → ~550 L)
- Modify: `content/6.cookbook/20.api-metrics.md` (944 → ~600 L)

- [ ] **Step 1:** Both are unique (no concept twin — keep them) but padded with copy-paste "example app" sections. In `19`: cut/condense "Dashboard Implementation", "Security Monitoring", "Geographic & Device Analytics", "User Activity Patterns" to representative snippets. **Verify `SessionAnalytics` / `SessionQueryBuilder` are still core** (not extracted) before keeping — `grep -rn "class SessionAnalytics" /Users/michaeltawiahsowah/Sites/glueful/framework/src/`. In `20`: trim the dashboard/usage-example balloon; keep the `ApiMetricsService`/`MetricsMiddleware`/`MetricsController`/schema reference.
- [ ] **Step 2:** Remove the hand-maintained "Table of Contents" blocks in both (the site auto-generates page TOC). Render-check; commit.

```bash
git add content/6.cookbook/19.sessions-analytics.md content/6.cookbook/20.api-metrics.md
git commit -m "docs: trim example-app sprawl + hand-written TOCs from sessions-analytics + api-metrics"
```

### Task 2.9: Phase 2 checkpoint — `pnpm build`

- [ ] **Step 1:** `pnpm build`. Phase 2 only trims pages in place (no routes deleted), so the risk is broken code fences / dropped MDC components from the heavy cuts. Expected: success, all trimmed pages still render with their kept sections, cross-links to canonical pages resolve. Fix before starting Phase 3.

---

## Phase 3 — `4.advanced/` collapse + deployment dedupe

### Task 3.1: Collapse redundant `4.advanced/` pages to stubs (or delete)

**Files:**
- Modify/Delete: `content/4.advanced/middleware.md`, `content/4.advanced/service-providers.md`
- (DI already reconciled in Task 1.3; testing in Task 1.6; performance in Task 3.3)

- [ ] **Step 1:** After Phase 1–2, `4.advanced/middleware.md`'s only unique asset is the **alias table** — confirm it now lives canonically here (the cookbook defers to it per Task 2.2). Keep `middleware.md` but trim it to: the `RouteMiddleware` interface, the alias table, parameters, and a link to `/cookbook/middleware` for recipes. Cut the anti-pattern hand-rolled examples.
- [ ] **Step 2:** `4.advanced/service-providers.md` overlaps both DI (Task 1.3) and `25.extensions`. Decide: if its provider mechanics are now fully covered by `4.advanced/dependency-injection.md`, reduce it to a stub that links there + to `/cookbook/extensions`; otherwise keep only the provider-lifecycle content unique to it. Fix the `config($context, ...)`-in-`defs()` scope bug (should be `$this->getContext()`).
- [ ] **Step 3:** If `service-providers.md` is deleted: `rg -n "advanced/service-providers" content/` → repoint. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: collapse redundant advanced/middleware + service-providers to canonical cores"
```

### Task 3.2: Verify-and-keep `4.advanced/repositories.md`

**Files:** Modify `content/4.advanced/repositories.md`

- [ ] **Step 1:** This is the one advanced page with unique, keep-worthy material (`BaseRepository`, `UnitOfWork`, `RepositoryFactory`, DTOs) and **no cookbook twin**. Do an accuracy pass against the current framework: `grep -rn "class UnitOfWork\|class RepositoryFactory\|class BaseRepository" /Users/michaeltawiahsowah/Sites/glueful/framework/src/`. Note `Glueful\Repository\UserRepository` was **removed** (extracted to `glueful/users`) — remove or rewrite any example that references it. Confirm `RepositoryFactory::notifications()` and `UnitOfWork` still exist; correct anything stale.
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/4.advanced/repositories.md
git commit -m "docs: accuracy pass on advanced/repositories (drop removed UserRepository refs)"
```

### Task 3.3: Merge `4.advanced/performance.md` into the cookbook, leave a stub

**Files:**
- Modify: `content/4.advanced/performance.md`
- (target already updated in Task 2.7)

- [ ] **Step 1:** `4.advanced/performance.md` (525 L) is generic PHP advice; `6.cookbook/21.performance.md` is the framework-real deep dive. Move the one keep-worthy section — "Configuration Tuning" (real cache/db config keys) — into `21.performance.md` (done in Task 2.7 if you did it there; otherwise do it here). Reduce `4.advanced/performance.md` to a short conceptual intro ("how to think about performance in Glueful") + links to `/cookbook/performance` and `/cookbook/memory-management`. Cut the hand-rolled `ab`/`wrk` generic snippets.
- [ ] **Step 2:** Render-check; commit.

```bash
git add -A content/
git commit -m "docs: reduce advanced/performance to intro + links (cookbook is canonical)"
```

### Task 3.4: Dedupe the triplicated health-probe / k8s block + firewall hardening

**Files:**
- Modify: `content/5.deployment/docker.md`, `content/5.deployment/production.md`, `content/5.deployment/monitoring.md`, `content/5.deployment/zero-downtime.md`, `content/5.deployment/security-hardening.md`

- [ ] **Step 1:** The built-in **health-endpoint + k8s-probe block** is copy-pasted across `docker.md`, `production.md`, `monitoring.md`, `zero-downtime.md`. Choose ONE canonical home (recommend `5.deployment/monitoring.md` since it's about observability — or `production.md`). In the other three, replace the full block with a 1–2 line summary + link to the canonical block.
- [ ] **Step 2:** The **firewall / PHP `disable_functions` / disable-services** hardening is duplicated between `production.md` and `security-hardening.md`. Keep it canonical in `security-hardening.md`; in `production.md` replace with a link.
- [ ] **Step 3:** Decide `5.deployment/monitoring.md`'s fate: its bespoke StatsD/Datadog/Sentry/`AlertService` classes (with undefined `$context`/`db()`) duplicate `20.api-metrics.md`. Trim to the (now-canonical) health-probe block + APM *guidance* + link to `/cookbook/api-metrics`; cut the hand-rolled classes.
- [ ] **Step 4:** Render-check all five; commit.

```bash
git add -A content/
git commit -m "docs: dedupe triplicated health-probe + firewall hardening across deployment/*"
```

---

## Phase 4 — Oversized pages, renames, getting-started cleanup

### Task 4.1: Split the frontend SDK out of `6.cookbook/4.error-handling.md` (2,101 → ~700 L)

**Files:** Modify `content/6.cookbook/4.error-handling.md`

- [ ] **Step 1:** This is the only true standalone topic (no concept twin) — it stays. But it embeds a full **client-side TypeScript/JavaScript `ApiClient`/`ApiError` SDK** (~L296–585) that does not belong in PHP backend docs. **Delete the entire client-side JS/TS section.** Also trim the near-duplicate handler-scaffold examples. Target ~600–800 L of server-side error handling (error format, `ExceptionHandler`, `Response` helpers, custom exceptions, per-domain error sections).
- [ ] **Step 2:** Render-check; commit.

```bash
git add content/6.cookbook/4.error-handling.md
git commit -m "docs: cut client-side JS/TS SDK from cookbook/error-handling; trim duplicate handlers"
```

### Task 4.2: Rename `6.cookbook/6.configuration.md` → "Service Options Resolver"

**Files:** Modify `content/6.cookbook/6.configuration.md`

- [ ] **Step 1:** This page is NOT app config — it documents the runtime `SimpleOptionsResolver` (per-service option validation), a genuine complement to `4.advanced/configuration.md`. Its current title "Configuration Options" makes readers conflate the two. Change the frontmatter `title`/`description` and the H1 to "Service Options Resolver" (or similar). Add a one-line "For application config files & env vars, see `/advanced/configuration`" cross-link, and reciprocate from `4.advanced/configuration.md`.
- [ ] **Step 2:** (Route stays `/cookbook/configuration` unless you also rename the file — renaming to `6.service-options.md` changes the route and needs a link audit. **Recommend keeping the filename**, changing only the title, to avoid route churn.) Render-check; commit.

```bash
git add content/6.cookbook/6.configuration.md content/4.advanced/configuration.md
git commit -m "docs: retitle cookbook/configuration to Service Options Resolver + cross-link"
```

### Task 4.3: Trim hand-written TOCs from remaining long cookbook pages

**Files:** Modify `content/6.cookbook/18.permissions-and-authorization.md`, `content/6.cookbook/25.extensions.md` (and any others still carrying a manual TOC: 8.database, 22.memory-management)

- [ ] **Step 1:** The docs site auto-generates a page TOC. Remove the hand-maintained "Table of Contents" link blocks from `18.permissions-and-authorization.md`, `25.extensions.md`, and any other page still carrying one (check `8.database.md`, `22.memory-management.md`). In `18`, also thin the longest worked examples. Keep these pages — they're canonical (permissions = the only Gate/voters/policies reference; extensions = the build/package how-to; memory-management = the only `MemoryManager` reference).
- [ ] **Step 2:** Render-check (confirm the auto TOC still appears in the right rail). Commit.

```bash
git add content/6.cookbook/
git commit -m "docs: drop redundant hand-written TOCs from long cookbook pages"
```

### Task 4.4: Paginate `releases.md` (4,677 L)

**Files:**
- Modify: `content/releases.md`
- Possibly Create: `content/releases-archive.md` (or per-major archive)

- [ ] **Step 1:** It's a *curated* changelog (83 entries back to v1.21), not junk — but 4,677 L on one page is a build/DOM/scan problem. Keep the **Release Summary table** + the most recent **3–5 full entries** (current major) inline on `releases.md`. Move older full entries to `content/releases-archive.md` (one archive page) and link to it, OR replace the long tail with links to `CHANGELOG.md`. The page already disclaims "for complete detail consult the full changelog," so trimming is low-risk.
- [ ] **Step 2:** `rg -n "releases#" content/` → check no deep-anchor links point into a moved entry; repoint to the archive if so. Render-check both pages; commit.

```bash
git add -A content/
git commit -m "docs: paginate releases.md (recent inline + archive page)"
```

### Task 4.5: Trim `4.advanced/index.md` + `getting-started/index.md` duplication

> **Routing confirmed (pre-checked):** `content.config.ts`'s `exclude: ['index.md']` drops only the **root** `index.md`; nested section index pages ARE in the `docs` collection and DO route/render — verified by the prerendered `dist/advanced.html` and `dist/getting-started.html`. So these section index pages are live (`/advanced`, `/getting-started`) and worth fixing. No collection/routing change is needed.

**Files:**
- Modify: `content/4.advanced/index.md`
- Modify: `content/1.getting-started/index.md` (if not fully handled in Task 0.7)

- [ ] **Step 1:** `4.advanced/index.md` (51 L) is a stale nav stub listing only 4 of 7 sibling pages (omits repositories, service-providers, dependency-injection). Regenerate the topic list to match the actual (post-consolidation) `4.advanced/` contents.
- [ ] **Step 2:** Confirm `getting-started/index.md` no longer re-teaches installation/quickstart inline (Task 0.7); if any duplicated install/quickstart blocks remain, reduce to pointers.
- [ ] **Step 3:** Render-check; commit.

```bash
git add content/4.advanced/index.md content/1.getting-started/index.md
git commit -m "docs: refresh advanced index nav list; de-dup getting-started index"
```

### Task 4.6: Move `6.cookbook/0.setup.md` to getting-started (REQUIRED)

This task is **required**, not optional — the final-verification zero-grep includes `cookbook/setup`, so the route must be removed for the suite to pass. If you decide not to move this page, you must instead drop `cookbook/setup` from the final grep; the plan's default is to do the move.

**Files:**
- Modify: `content/1.getting-started/1.installation.md` (fold in unique bits) OR Create: `content/1.getting-started/<n>.setup.md`
- Modify: `content/6.cookbook/index.md` (remove the setup entry)
- Delete: `content/6.cookbook/0.setup.md`

- [ ] **Step 1:** `0.setup.md` (95 L: skeleton-vs-library install + bootstrap) is conceptually getting-started material misfiled in the cookbook. Default: fold its unique bits into `1.getting-started/1.installation.md`. Verify it doesn't duplicate `1.installation.md`/`2.quickstart.md` before moving — fold, don't duplicate.
- [ ] **Step 2:** `rg -n "cookbook/setup" content/` → repoint each (default target `/getting-started/installation`), **including the `content/6.cookbook/index.md` entry**. Delete the cookbook page. Render-check; commit.

```bash
git add -A content/
git commit -m "docs: move cookbook/setup into getting-started"
```

---

## Final verification (after all phases)

**Verification scope: content-only = `pnpm build`.** This plan changes only `content/*.md`, so `pnpm build` (which parses all MDC + prerenders every route) is the gate. **Do NOT run `pnpm lint` / typecheck** — they target `app/` source, not markdown, and would only add noise here. (If a future task in this plan touches a `.vue`/`.ts` file, that task must call out lint explicitly; none currently do.)

- [ ] `pnpm build` succeeds with no content/MDC parse errors and no prerender 404s.
- [ ] Deleted routes are fully repointed — this returns **zero** results:

```bash
rg -n "cookbook/(validation|events|di-and-services|file-uploads|distributed-locks|testing|deployment|setup)\b" content/
```
(These eight are the routes this plan deletes. `cookbook/console-commands` is NOT here — it's trimmed in place, route preserved. If Task 2.6 chose to delete `5.deployment/logging.md`, also confirm `rg -n "deployment/logging" content/` is clean.)
- [ ] `content/6.cookbook/index.md` has no entries pointing at deleted pages (it is hand-written; the grep above covers it since it lives under `content/`).
- [ ] Sidebar shows no orphaned/empty entries; every nav link resolves (the `pnpm build` prerender pass surfaces broken links).
- [ ] Spot-check that the canonical pages which received merged content render fully (validation, events, DI, file-uploads, distributed-locks, testing, notifications, performance).
- [ ] No remaining hand-rolled/hallucinated APIs in the pages touched (AES-CBC `Encryptor`, invented logger classes, static `Notifications::`/`Storage::` facades, `field_selection` duplicate in alias tables).

## Outcome summary (target)

| Bucket | Action | Files |
|---|---|---|
| Accuracy bugs | Fix in place | 7 tasks, ~10 files |
| ① Pure duplicates | Merge unique bit up, delete | `cookbook/{9.validation, 12.events, 3.di-and-services, 14.file-uploads, 17.distributed-locks, 26.testing, 24.deployment}` (+ `23.console-commands` trimmed to a recipe) |
| ② Bloated duplicators | Trim 50–70% to advanced recipes | `cookbook/{1.routing, 2.middleware, 10.caching, 11.queues-and-jobs, 13.notifications, 7.logging, 21.performance}` + sprawl trims (`19`, `20`) |
| `4.advanced/` | Collapse redundant to stubs; keep `repositories` (verified) + `configuration` (complement) | `advanced/{middleware, service-providers, performance, testing, dependency-injection}` |
| `5.deployment/` | Keep docker/production/zero-downtime/security; merge logging+monitoring to cookbooks; dedupe health-probe/firewall | `deployment/*` |
| Oversized | Split JS out of error-handling; paginate releases | `cookbook/4.error-handling`, `releases.md` |
| Renames/nav | Service Options Resolver; refresh indexes; drop manual TOCs | several |

**Net:** the ~26K-line cookbook collapses toward ~10–12K of non-duplicative advanced/infra recipes; the concept layer (`essentials`/`features`/`advanced`/`deployment`) becomes the single canonical entry point per topic.
