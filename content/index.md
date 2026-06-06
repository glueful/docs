---
seo:
  title: Glueful — Build Production PHP APIs Faster
  description: Start from the Glueful API skeleton and ship secure, documented PHP APIs with explicit routing, context-aware DI, auth, queues, storage, and OpenAPI generation.
---

::div{class="relative mx-auto w-full max-w-(--ui-container) px-6 pt-20 pb-16 sm:pt-28 lg:pt-32"}

:::u-badge{variant="subtle" color="neutral" size="lg"}
PHP 8.3+ · API-skeleton first
:::

<h1 class="mt-6 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tighter text-balance text-highlighted">Build production PHP APIs without starting from zero.</h1>

<p class="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300">A pragmatic, high-performance API framework. Start from <strong class="font-semibold text-highlighted whitespace-nowrap">glueful/api-skeleton</strong> and grow into a full platform — explicit routing, context-aware DI, auth &amp; identity, queues, storage, and generated OpenAPI docs — without the boilerplate.</p>

:::div{class="mt-8 flex flex-wrap items-center gap-3"}
::::u-button{size="xl" to="/getting-started" trailing-icon="i-lucide-rocket" class="bg-raspberry-500 hover:bg-raspberry-600 text-white"}
Get started
::::

::::u-button{size="xl" color="neutral" variant="outline" icon="i-tabler-brand-github-filled" to="https://github.com/glueful" target="_blank"}
Star on GitHub
::::
:::

:::div{class="hero-code mt-14 w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-xl shadow-black/5 dark:border-white/10 dark:bg-gray-900 dark:shadow-black/30"}
::::code-group

```php [routes/api.php]
$router->post('/users', [UserController::class, 'store'])
    ->middleware(['auth', 'rate_limit'])
    ->name('users.store');
```

```php [UserController.php]
#[Controller(prefix: '/api/v1')]
final class UserController extends BaseController
{
    public function __construct(
        ApplicationContext $context,
        private readonly UserService $users,
    ) {
        parent::__construct($context);
    }

    #[Post('/users')]
    public function store(Request $request): Response
    {
        $dto  = CreateUserDTO::fromRequest(RequestHelper::getRequestData($request));
        $user = $this->users->create($this->getContext(), $dto);

        return $this->created($user, 'User created');
    }
}
```

```json [Response]
{
  "success": true,
  "message": "User created",
  "data": {
    "uuid": "u_a1b2c3",
    "email": "ada@example.com",
    "status": "active"
  }
}
```

::::
:::

::

::div{class="border-y border-gray-200/70 dark:border-white/10 bg-gray-50/60 dark:bg-white/5"}
  <div class="mx-auto max-w-5xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-600 dark:text-gray-300">
    <span class="inline-flex items-center gap-2"><span class="i-lucide-badge-check h-4 w-4 text-gray-400 dark:text-gray-500"></span> MIT licensed</span>
    <span class="inline-flex items-center gap-2"><span class="i-lucide-file-json h-4 w-4 text-gray-400 dark:text-gray-500"></span> OpenAPI built-in</span>
    <span class="inline-flex items-center gap-2"><span class="i-lucide-boxes h-4 w-4 text-gray-400 dark:text-gray-500"></span> Context-aware DI</span>
    <span class="inline-flex items-center gap-2"><span class="i-lucide-terminal h-4 w-4 text-gray-400 dark:text-gray-500"></span> First-class CLI</span>
    <span class="inline-flex items-center gap-2"><span class="i-lucide-blocks h-4 w-4 text-gray-400 dark:text-gray-500"></span> 9 official extensions</span>
    <span class="inline-flex items-center gap-2"><span class="i-lucide-gauge h-4 w-4 text-gray-400 dark:text-gray-500"></span> 40k+ resp/sec</span>
  </div>
::

<section class="border-t border-gray-200/70 dark:border-white/10">
  <div class="mx-auto w-full max-w-(--ui-container) px-6 py-20 sm:py-24">
    <div class="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/70 dark:border-white/10 dark:bg-white/10 lg:grid-cols-3 lg:gap-px">
      <div class="bg-white p-8 dark:bg-gray-950 lg:p-10">
        <p class="font-mono text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500">Getting started</p>
        <h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white">Up and running in seconds</h3>
        <p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Scaffold the API skeleton and start a real server — SQLite, queues, and OpenAPI are configured out of the box.</p>
        <div class="mt-6 flex flex-wrap gap-2">
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">php glueful serve</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">migrate:run</code>
        </div>
      </div>
      <div class="flex flex-col justify-center gap-4 bg-white p-8 dark:bg-gray-950 lg:col-span-2 lg:p-10">
        <div class="rounded-xl bg-gray-900 p-4 ring-1 ring-white/10">
          <div class="mb-2 font-mono text-[11px] uppercase tracking-widest text-gray-500">Create a project</div>
          <div class="font-mono text-sm text-gray-100"><span class="text-emerald-400">$</span> composer create-project glueful/api-skeleton my-api</div>
        </div>
        <div class="rounded-xl bg-gray-900 p-4 ring-1 ring-white/10">
          <div class="mb-2 font-mono text-[11px] uppercase tracking-widest text-gray-500">Start the server</div>
          <div class="font-mono text-sm text-gray-100"><span class="text-emerald-400">$</span> cd my-api &amp;&amp; php glueful serve</div>
        </div>
      </div>
      <div class="bg-white p-8 dark:bg-gray-950">
        <h3 class="text-lg font-medium tracking-tight text-gray-900 dark:text-white">A CLI for everything</h3>
        <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Scaffold code, run migrations and workers, and generate docs — one consistent <code class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.8em] text-gray-700 dark:bg-white/10 dark:text-gray-200">php glueful</code> entrypoint.</p>
        <div class="mt-5 flex flex-wrap gap-2">
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">scaffold:controller</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">migrate:run</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">queue:work</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">generate:openapi</code>
        </div>
      </div>
      <div class="bg-white p-8 dark:bg-gray-950">
        <h3 class="text-lg font-medium tracking-tight text-gray-900 dark:text-white">Explicit routing, DI &amp; auth</h3>
        <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Context-aware services, attribute routing, and JWT / session / API-key auth over a pluggable user store.</p>
        <div class="mt-5 flex flex-wrap gap-2">
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">ApplicationContext</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">#[Controller]</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">#[RequireScope]</code>
        </div>
      </div>
      <div class="bg-white p-8 dark:bg-gray-950">
        <h3 class="text-lg font-medium tracking-tight text-gray-900 dark:text-white">Queues, OpenAPI &amp; extensions</h3>
        <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Background jobs, generated OpenAPI + typed SDKs, and an official extension ecosystem you add as you grow.</p>
        <div class="mt-5 flex flex-wrap gap-2">
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">queue:work</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">generate:openapi --ui</code>
          <code class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">glueful/aegis</code>
        </div>
      </div>
    </div>
  </div>
</section>

::div{class="path-fade relative overflow-hidden border-t border-gray-200/70 dark:border-white/10"}

:::div{class="mx-auto grid w-full max-w-(--ui-container) grid-cols-1 lg:grid-cols-5 lg:items-stretch"}

::::div{class="px-6 py-20 sm:py-24 lg:col-span-2 lg:self-center lg:py-16 lg:pr-12"}
<h2 class="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 dark:text-white">A request has one clear path</h2>
<p class="mt-5 text-base leading-relaxed text-gray-600 dark:text-gray-300">Thin controllers, validation in DTOs, business logic in services, data access in repositories — easy to read, easy to test, with no hidden magic or global state.</p>
<ul class="mt-7 space-y-3 text-sm text-gray-700 dark:text-gray-200"><li class="flex items-start gap-2.5"><span class="i-lucide-check mt-0.5 h-4 w-4 shrink-0 text-raspberry-600"></span>Thin controllers that just shape the response</li><li class="flex items-start gap-2.5"><span class="i-lucide-check mt-0.5 h-4 w-4 shrink-0 text-raspberry-600"></span>Validation in DTOs, orchestration in services</li><li class="flex items-start gap-2.5"><span class="i-lucide-check mt-0.5 h-4 w-4 shrink-0 text-raspberry-600"></span>Context-aware DI — no hidden globals</li><li class="flex items-start gap-2.5"><span class="i-lucide-check mt-0.5 h-4 w-4 shrink-0 text-raspberry-600"></span>N+1 detection &amp; query caching built in</li></ul>

:::::u-button{class="mt-8" to="/essentials/routing" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-up-right"}
Explore the architecture
:::::

::::

::::div{class="hero-code relative mx-6 mb-12 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl shadow-black/5 dark:border-white/15 dark:bg-gray-900 lg:col-span-3 lg:mx-0 lg:mb-0 lg:mt-24 lg:rounded-bl-none lg:rounded-br-none lg:rounded-tr-2xl lg:rounded-tl-2xl lg:border-b-0 lg:border-r-0 lg:shadow-2xl"}
:::::code-group

```php [routes/api.php]
$router->post('/users', [UserController::class, 'store'])
    ->middleware(['auth', 'rate_limit']);
```

```php [UserController.php]
public function store(Request $request): Response
{
    $dto  = CreateUserDTO::fromRequest(RequestHelper::getRequestData($request));
    $user = $this->users->create($this->getContext(), $dto);

    return $this->created($user, 'User created');
}
```

```php [UserService.php]
public function create(ApplicationContext $ctx, CreateUserDTO $dto): array
{
    return db($ctx)->transaction(function () use ($dto) {
        $user = $this->users->insert($dto->toArray());
        $this->events->dispatch(new UserCreated($user));

        return $user;
    });
}
```

```php [UserRepository.php]
public function insert(array $data): array
{
    $data['uuid'] = Utils::generateNanoID();
    $this->db->table('users')->insert($data);

    return $this->findByUuid($data['uuid']);
}
```

:::::
::::

:::

::

::u-page-section
---
class: border-t border-gray-300 dark:border-white/10
ui:
  container: py-12! sm:py-16! lg:py-20!
---

#headline
<span class="block w-full font-mono text-xs font-medium uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Out of the box</span>

#title
<span class="block text-left w-full text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-highlighted">What you get immediately</span>

#description
<span class="block text-lg text-left text-gray-600 dark:text-gray-300">The starter path shortens the gap between “new project” and “working API with operational basics.”</span>

#default

:::div{class="mx-auto mt-4 grid max-w-(--ui-container) grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-300 bg-gray-300 dark:border-white/15 dark:bg-white/15 sm:grid-cols-2 lg:grid-cols-3"}

::::div{class="bg-white p-6 dark:bg-gray-900"}
:::::div{class="icon-tile mb-5 flex size-9 items-center justify-center rounded-lg"}
:u-icon{name="i-lucide-wand-sparkles" class="size-5 text-raspberry-600 dark:text-raspberry-400"}
:::::
<h3 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Scaffolding</h3>
<p class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">Generate controllers, models, DTOs, jobs, rules, tests, factories, seeders, filters, and middleware with the scaffold commands.</p>
::::

::::div{class="bg-white p-6 dark:bg-gray-900"}
:::::div{class="icon-tile mb-5 flex size-9 items-center justify-center rounded-lg"}
:u-icon{name="i-lucide-book-open-text" class="size-5 text-raspberry-600 dark:text-raspberry-400"}
:::::
<h3 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">API documentation</h3>
<p class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">generate:openapi --ui produces your spec and a browsable UI — no separate docs stack to maintain.</p>
::::

::::div{class="bg-white p-6 dark:bg-gray-900"}
:::::div{class="icon-tile mb-5 flex size-9 items-center justify-center rounded-lg"}
:u-icon{name="i-lucide-server-cog" class="size-5 text-raspberry-600 dark:text-raspberry-400"}
:::::
<h3 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Operational defaults</h3>
<p class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">Health checks, security scanning, route diagnostics, queue presets, and deployment-oriented config from the start.</p>
::::

::::div{class="bg-white p-6 dark:bg-gray-900"}
:::::div{class="icon-tile mb-5 flex size-9 items-center justify-center rounded-lg"}
:u-icon{name="i-lucide-gauge" class="size-5 text-raspberry-600 dark:text-raspberry-400"}
:::::
<h3 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Rate limiting</h3>
<p class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">Per-route, builder-configured throttling with sliding-window algorithms and pluggable storage.</p>
::::

::::div{class="bg-white p-6 dark:bg-gray-900"}
:::::div{class="icon-tile mb-5 flex size-9 items-center justify-center rounded-lg"}
:u-icon{name="i-lucide-filter" class="size-5 text-raspberry-600 dark:text-raspberry-400"}
:::::
<h3 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Field selection</h3>
<p class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">GraphQL-style fields and expand projection with depth limits and whitelist protection.</p>
::::

::::div{class="bg-white p-6 dark:bg-gray-900"}
:::::div{class="icon-tile mb-5 flex size-9 items-center justify-center rounded-lg"}
:u-icon{name="i-lucide-flask-conical" class="size-5 text-raspberry-600 dark:text-raspberry-400"}
:::::
<h3 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Testing</h3>
<p class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">PHPUnit 10 with a real booted app for feature tests and a lightweight SQLite harness for libraries.</p>
::::

:::

::

::u-page-section
---
class: pkg-glow border-t border-gray-300 dark:border-white/10
ui:
  container: py-12! sm:py-16! lg:py-20!
---

#headline
<span class="block w-full text-left font-mono text-xs font-medium uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Official packages</span>

#title
<span class="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-highlighted block text-left w-full">Grow with official extensions</span>

#description
<div class="block text-left w-full text-lg text-gray-600 dark:text-gray-300">Keep the core lean; add product capabilities as Composer packages when you need them.</div>

#default

<div class="grid  grid-cols-1 overflow-hidden rounded-2xl border border-gray-300 dark:border-white/15 lg:grid-cols-2"><div class="flex min-h-72 flex-col border-b border-gray-300 bg-white/70 p-10 backdrop-blur-sm dark:border-white/15 dark:bg-gray-900/70 lg:min-h-80 lg:border-r lg:p-14"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Auth</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Identity &amp; access</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Authenticate users and authorize every request — a pluggable user store, role-based access control, and OAuth / SSO.</p><div class="mt-auto flex flex-wrap gap-2 pt-12"><a href="https://packagist.org/packages/glueful/users" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Users</a><a href="https://packagist.org/packages/glueful/aegis" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Aegis</a><a href="https://packagist.org/packages/glueful/entrada" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Entrada</a></div></div><div class="flex min-h-72 flex-col border-b border-gray-300 bg-white/70 p-10 backdrop-blur-sm dark:border-white/15 dark:bg-gray-900/70 lg:min-h-80 lg:p-14"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Messaging</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Reach your users</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Transactional email, push notifications, and SMS / WhatsApp messaging from one consistent delivery API.</p><div class="mt-auto flex flex-wrap gap-2 pt-12"><a href="https://packagist.org/packages/glueful/email-notification" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Email</a><a href="https://packagist.org/packages/glueful/notiva" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Notiva</a><a href="https://packagist.org/packages/glueful/conversa" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Conversa</a></div></div><div class="flex min-h-72 flex-col border-b border-gray-300 bg-white/70 p-10 backdrop-blur-sm dark:border-white/15 dark:bg-gray-900/70 lg:min-h-80 lg:border-b-0 lg:border-r lg:p-14"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Data &amp; billing</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Search &amp; payments</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Full-text search and a unified payment-gateway bridge — added as Composer packages when you need them.</p><div class="mt-auto flex flex-wrap gap-2 pt-12"><a href="https://packagist.org/packages/glueful/meilisearch" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Meilisearch</a><a href="https://packagist.org/packages/glueful/payvia" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Payvia</a></div></div><div class="flex min-h-72 flex-col bg-white/70 p-10 backdrop-blur-sm dark:bg-gray-900/70 lg:min-h-80 lg:p-14"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Runtime</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Performance at scale</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Run long-lived PHP processes on RoadRunner, Swoole, or FrankenPHP for higher throughput on the same code.</p><div class="mt-auto flex flex-wrap gap-2 pt-12"><a href="https://packagist.org/packages/glueful/runiva" target="_blank" rel="noopener" class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">Runiva</a></div></div></div>

:::div{class="text-center"}
  ::::u-button{color="neutral" variant="outline" size="lg" to="/extensions" trailing-icon="i-lucide-arrow-right"}
  Browse all extensions
  ::::
:::
::

::div{class="relative overflow-hidden border-t border-gray-300 bg-gradient-to-t from-raspberry-500/5 to-transparent dark:border-white/10 dark:from-raspberry-500/10"}

:::div{class="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16"}

::::div{class="lg:pr-8"}
<span class="block font-mono text-xs font-medium uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Quickstart</span>
<h2 class="mt-4 text-3xl font-medium tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">From new project to first endpoint in minutes</h2>
<p class="mt-6 max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">Scaffold the skeleton, generate a controller, and ship documented JSON — in a handful of commands, no boilerplate to wire up first.</p>

:::::u-button{size="xl" to="/getting-started" trailing-icon="i-lucide-rocket" class="mt-8 bg-raspberry-500 hover:bg-raspberry-600 text-white"}
Read the quickstart
:::::
::::

::::div{class="dark"}
:::::hero-terminal
---
lines:
  - segments:
      - { text: "$ ", style: prompt }
      - { text: "composer create-project glueful/api-skeleton my-api", style: cmd }
  - segments:
      - { text: "  Installing dependencies… done", style: dim }
  - segments:
      - { text: "$ ", style: prompt }
      - { text: "cd my-api && php glueful serve", style: cmd }
  - segments:
      - { text: "  ✓ Server running ", style: success }
      - { text: "http://localhost:8000", style: url }
  - segments:
      - { text: "$ ", style: prompt }
      - { text: "php glueful scaffold:controller Post ", style: cmd }
      - { text: "--api", style: flag }
  - segments:
      - { text: "  ✓ Created PostController", style: success }
  - segments:
      - { text: "$ ", style: prompt }
      - { text: "curl ", style: cmd }
      - { text: "localhost:8000/api/posts", style: url }
  - segments:
      - { text: "  {\"success\":true,\"data\":[]}", style: success }
---
:::::
::::

:::

::
