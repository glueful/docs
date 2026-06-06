---
seo:
  title: Glueful — Build Production PHP APIs Faster
  description: Start from the Glueful API skeleton and ship secure, documented PHP APIs with explicit routing, DI, auth, queues, storage, and operational tooling.
---
::u-page-hero{orientation = "horizontal" class="home-page-hero"}


::div{class="absolute inset-0 bg-gradient-to-br from-azure-radiance-50/20 via-rose-50/15 to-raspberry-50/20 dark:from-azure-radiance-950/10 dark:via-rose-950/8 dark:to-raspberry-950/10 -z-10"}
::

#headline
<span class="font-bold text-raspberry-600">Glueful</span>

#title
<span class="font-light text-gray-900 dark:text-white text-5xl lg:text-6xl">Build <span class="font-semibold text-raspberry-600">production PHP APIs</span></span><br><span class="font-bold text-raspberry-600 text-5xl lg:text-6xl">without starting from zero</span>

#description

<p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
  Start with <strong class="text-azure-radiance-600">glueful/api-skeleton</strong>, then grow into a full API platform with explicit routing, context-aware DI, authentication flows, queues, notifications, storage, OpenAPI generation, and operational CLI tooling.
</p>

<div class="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-600 dark:text-gray-400">
  <div class="flex items-center gap-2">
    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
    <span>API Skeleton First</span>
  </div>
  <div class="flex items-center gap-2">
    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
    <span>Explicit Routes + DI</span>
  </div>
  <div class="flex items-center gap-2">
    <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
    <span>Built For Real Deployments</span>
  </div>
</div>

#links
  :::u-button{class="bg-azure-radiance-500 hover:bg-azure-radiance-600 text-white hover:shadow-azure-radiance-500/25 transform hover:scale-105 transition-all duration-300 hover:animate-none"}
  ---
  size: xl
  to: /getting-started
  trailing-icon: i-lucide-rocket
  ---
  Start With The Skeleton
  :::

  :::u-button{class="hover:shadow-primary-500/25 transform hover:scale-105 transition-all duration-300 hover:animate-none"}
  ---
  color: neutral
  icon: i-tabler-brand-github-filled
  size: xl
  target: _blank
  to: https://github.com/glueful
  variant: solid
  ---
  GitHub
  :::

  :::u-button{class="hover:shadow-primary-500/25 transform hover:scale-105 transition-all duration-300 hover:animate-none"}
  ---
  color: neutral
  size: xl
  to: /extensions
  variant: outline
  trailing-icon: i-lucide-box
  ---
  Browse Extensions
  :::
#default
  :::prose-pre{code = "composer create-project glueful/api-skeleton my-project" filename = "Terminal"}
  ```bash [Terminal]
  composer create-project glueful/api-skeleton my-project
  cd my-project
  php glueful install --quiet
  php glueful scaffold:controller UserController --api
  php glueful generate:openapi --ui
  php glueful serve
  ```
  :::
::

::div{class="hidden lg:block fixed right-56 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-azure-radiance-400/60 to-transparent dark:via-azure-radiance-600/60 z-10"}
::
::div{class="hidden lg:block fixed right-52 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-raspberry-400/40 to-transparent dark:via-raspberry-600/40 z-10"}
::
::div{class="hidden lg:block fixed left-48 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-raspberry-400/60 to-transparent dark:via-raspberry-600/60 z-10"}
::
::div{class="hidden lg:block fixed left-44 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-azure-radiance-400/40 to-transparent dark:via-azure-radiance-600/40 z-10"}
::

::div{class="h-px bg-gradient-to-r from-transparent via-raspberry-400/50 via-purple-400/50 to-transparent dark:via-raspberry-600/50 dark:via-purple-600/50"}
::

::u-page-section{class="relative overflow-x-hidden bg-white dark:bg-gray-950 py-0"}

#title
<div class="mt-12 mb-6 scroll-mt-[calc(48px+45px+var(--ui-header-height))] lg:scroll-mt-[calc(48px+var(--ui-header-height))] [&>a]:focus-visible:outline-(--ui-primary) [&>a>code]:border-dashed hover:[&>a>code]:border-(--ui-primary) hover:[&>a>code]:text-(--ui-primary) [&>a>code]:text-xl/7 [&>a>code]:font-bold [&>a>code]:transition-colors text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted text-left @container relative flex">
  <div class="*:leading-9">
    <p class="my-5 leading-7 text-pretty font-normal text-gray-600 dark:text-gray-300 ">A faster path from idea to deployed API</p>
  </div>
  <div class="hidden @min-[1020px]:block"><img src="/images/light/line-2.svg" alt="Line Decoration" class="absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"></div>
</div>

#description

<div class="text-left mb-12 text-gray-600 dark:text-gray-300 max-w-3xl">
  Glueful is opinionated where it helps: start from a working API app, use explicit routes and controllers, rely on context-aware DI instead of hidden globals, and add higher-level features only when your app needs them.
</div>

<div class="flex items-center gap-8 mb-8 text-sm text-gray-500 dark:text-gray-400 text-left">
  <div class="flex items-center gap-2">
    <div class="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
    <span>PHP 8.3+</span>
  </div>
  <div class="flex items-center gap-2">
    <div class="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
    <span>ApplicationContext + DI</span>
  </div>
  <div class="flex items-center gap-2">
    <div class="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
    <span>OpenAPI + CLI Tooling</span>
  </div>
</div>

:::clean-code-showcase
:::

::

::div{class="h-px bg-gradient-to-r from-transparent via-azure-radiance-400/50 via-purple-400/50 to-transparent dark:via-azure-radiance-600/50 dark:via-purple-600/50"}
::

::u-page-section{class="isolate relative overflow-hidden bg-gradient-to-br from-raspberry-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16"}

#title
<div class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted text-left @container relative flex">
  <div class="*:leading-9">
    <p class="my-5 leading-7 text-pretty font-normal text-gray-600 dark:text-gray-300">Why developers adopt <span class="text-azure-radiance-500 font-semibold">Glueful</span></p>
  </div>
  <div class="hidden @min-[1020px]:block">
    <img class="absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]" src="/images/light/line-2.svg" alt="Line Decoration"/>
  </div>
</div>

#description

<div class="text-lg text-gray-600 dark:text-gray-300 text-left max-w-3xl">
  <p>Glueful is strongest when you want a pragmatic API framework that starts lean but already includes the hard parts teams usually stitch together later.</p>
</div>

<div class="flex items-center gap-8 mb-12 text-sm text-gray-500 dark:text-gray-400">
  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold text-azure-radiance-600">Fast</span>
    <span>Onboarding</span>
  </div>
  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold text-azure-radiance-600">Explicit</span>
    <span>Architecture</span>
  </div>
  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold text-azure-radiance-600">Built-In</span>
    <span>API Ops</span>
  </div>
</div>

#features
  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Start From A Working API App</span>

  #description
  <div>`glueful/api-skeleton` gives you bootstrap, config, starter routes, migrations, SQLite by default, queue configuration, OpenAPI configuration, extension loading, and a real CLI entrypoint on day one.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Stay Explicit As You Scale</span>

  #description
  <div>Glueful’s `ApplicationContext`, explicit routing, and container-driven services make the architecture easier to reason about than magic-heavy frameworks that hide request state and service resolution.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Ship More Than CRUD</span>

  #description
  <div>Auth flows, notifications, queues, rate limiting, distributed locks, file uploads, OpenAPI generation, and production checks are already part of the framework story, not an afterthought.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Add Official Extensions</span>

  #description
  <div>Extend the core with official packages for identity &amp; accounts, RBAC, social login, email delivery, push notifications, SMS/WhatsApp, full-text search, payments, and runtime integrations without turning the framework itself into a monolith.</div>

  :::
::

::div{class="h-px bg-gradient-to-r from-transparent via-raspberry-400/50 via-purple-400/50 to-transparent dark:via-raspberry-600/50 dark:via-purple-600/50"}
::

::u-page-section{class="bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950 py-16"}

#title
<span class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted text-center mb-4">
  <span class="text-gray-900 dark:text-white font-light">What developers get <span class="text-raspberry-600 font-semibold">immediately</span></span>
</span>

#description
<div class="text-center mb-12 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
  Glueful’s starter path is valuable because it shortens the gap between “new project” and “working API with operational basics.”
</div>

#features
  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Scaffolding</span>

  #description
  <div>Generate controllers, models, requests, jobs, rules, tests, factories, seeders, filters, and middleware with the `scaffold:*` commands instead of hand-rolling boilerplate.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">API Documentation</span>

  #description
  <div>Use `php glueful generate:openapi --ui` to generate your API spec and a browsable UI without wiring a separate documentation stack together.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Operational Defaults</span>

  #description
  <div>Health checks, security scanning, route diagnostics, queue presets, storage configuration, and deployment-oriented config are present from the start.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">API Ergonomics</span>

  #description
  <div>Versioning, field selection, rate limiting, eventing, notifications, and extension hooks make Glueful fit real API teams better than a bare router-and-container setup.</div>

  :::
::

::div{class="h-px bg-gradient-to-r from-transparent via-azure-radiance-400/50 via-purple-400/50 to-transparent dark:via-azure-radiance-600/50 dark:via-purple-600/50"}
::

::u-page-section{class="api-generation-container bg-gradient-to-b from-white to-azure-radiance-50/40 dark:from-gray-950 dark:to-gray-900"}

#title

<span class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted text-center mb-4">
  <span class="text-gray-900 dark:text-white font-light">From starter app to <span class="text-raspberry-600 font-semibold">production API platform</span></span>
</span>

#description

<div class="text-center mb-12 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
  Start with routes and controllers in the skeleton. Then add database-backed resources, auth and sessions, queues and notifications, storage, extensions, and generated OpenAPI docs as the application grows.
</div>

#features
  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Good Fit For</span>

  #description
  <div>Internal APIs, SaaS backends, webhook-heavy services, queue-driven workloads, and teams that want explicit PHP architecture without rebuilding the same API infrastructure on every project.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Extension Ecosystem</span>

  #description
  <div>Start with the lean framework, then add Users, Aegis, Entrada, Payvia, Meilisearch, Notiva, Conversa, email-notification, and other Glueful extensions as your product needs grow.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Next Step</span>

  #description
  <div>Start with the install path, build your first endpoint, then move into routing, validation, auth, queues, and deployment with the docs path that matches the framework’s current API surface.</div>

  :::
::
