---
title: Extensions
description: Official Glueful extensions for identity/accounts, RBAC, multi-tenancy, SSO, email, push, SMS/WhatsApp, search, payments, and runtime integrations.
---

::u-page-section

#headline
<span class="block w-full text-left font-mono text-xs font-medium uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Extensions</span>

#title
<span class="block w-full text-left text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-highlighted">
  Extend <span class="text-raspberry-600">Glueful</span> without bloating the core
</span>

#description
<div class="block w-full text-left text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
  Glueful keeps the framework lean and lets you add product-specific capabilities through extensions. Official packages are published as Composer packages of type <code>glueful-extension</code> and can also be developed locally from the <code>extensions/</code> directory in your app.
</div>

#features
  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Composer-Native</span>

  #description
  <div>Install extensions with Composer, rebuild the extension cache, and keep your application modular as requirements grow.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Auto-Discoverable</span>

  #description
  <div>Glueful can discover extension packages and load their providers, routes, migrations, commands, and configuration through the extension system.</div>

  :::

  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Local Development Friendly</span>

  #description
  <div>Develop and test local extensions from the repository or app-level <code>extensions/</code> directory before publishing packages.</div>

  :::
::

::u-page-section{class="bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950"}

#headline
<span class="block w-full text-left font-mono text-xs font-medium uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Ecosystem</span>

#title
<span class="block w-full text-left text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-highlighted">
  Official packages
</span>

#description
<div class="block w-full text-left text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
  These packages are part of the current Glueful ecosystem and cover common product needs that many API teams want to add without building them from scratch.
</div>

<div class="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-300 bg-gray-300 dark:border-white/15 dark:bg-white/15 sm:grid-cols-2"><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Identity</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Users</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">The default first-party user store — accounts, verification, and optional 2FA.</p><a href="https://packagist.org/packages/glueful/users" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/users</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">RBAC</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Aegis</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Roles, permissions, and authorization for your API.</p><a href="https://packagist.org/packages/glueful/aegis" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/aegis</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Multi-Tenancy</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Tenancy</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Row-level multi-tenancy — automatic per-tenant data isolation, memberships, and resolution.</p><a href="https://packagist.org/packages/glueful/tenancy" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/tenancy</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">OAuth / SSO</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Entrada</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Social login and SSO via OAuth and OpenID Connect.</p><a href="https://packagist.org/packages/glueful/entrada" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/entrada</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Email</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Email Notification</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Transactional email built on Symfony Mailer.</p><a href="https://packagist.org/packages/glueful/email-notification" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/email-notification</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Push</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Notiva</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Push notifications for FCM, APNs, and Web Push.</p><a href="https://packagist.org/packages/glueful/notiva" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/notiva</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">SMS / WhatsApp</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Conversa</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">SMS and WhatsApp messaging with swappable providers.</p><a href="https://packagist.org/packages/glueful/conversa" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/conversa</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Search</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Meilisearch</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Fast full-text search and indexing.</p><a href="https://packagist.org/packages/glueful/meilisearch" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/meilisearch</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Payments</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Payvia</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">One payment API for Stripe, Paystack, and Flutterwave.</p><a href="https://packagist.org/packages/glueful/payvia" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/payvia</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Runtime</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Runiva</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Long-lived runtimes on RoadRunner, Swoole, or FrankenPHP.</p><a href="https://packagist.org/packages/glueful/runiva" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/runiva</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Media</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Media</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Image processing, thumbnails, and media metadata (Intervention Image + getID3).</p><a href="https://packagist.org/packages/glueful/media" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/media</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Edge Cache</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">CDN</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Edge cache-control headers and content purge via pluggable provider adapters.</p><a href="https://packagist.org/packages/glueful/cdn" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/cdn</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Queue Ops</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Queue Ops</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Supervised worker fleets, autoscaling, and worker/job metrics.</p><a href="https://packagist.org/packages/glueful/queue-ops" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/queue-ops</a></div><div class="flex min-h-72 flex-col bg-white p-10 text-left dark:bg-gray-950 lg:p-12"><p class="font-mono text-xs uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Archive</p><h3 class="mt-4 text-2xl font-medium tracking-tight text-gray-900 dark:text-white lg:text-3xl">Archive</h3><p class="mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">Generic table archiving — archive, restore, and search with a registry.</p><a href="https://packagist.org/packages/glueful/archive" target="_blank" rel="noopener" class="mt-auto inline-flex w-fit items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 transition-colors hover:text-raspberry-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-raspberry-400">glueful/archive</a></div></div>
::

::u-page-section

#headline
<span class="block w-full text-left font-mono text-xs font-medium uppercase tracking-widest text-raspberry-600 dark:text-raspberry-400">Local development</span>

#title
<span class="block w-full text-left text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-highlighted">
  Local and custom extensions
</span>

#description
<div class="block w-full text-left text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
  The local repository also includes extension packages used for active Glueful development and integration work.
</div>

#features
  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Build Your Own</span>

  #description
  <div>Glueful's extension system supports local packages with providers, routes, config, migrations, and commands. See the extension cookbook page for creation and packaging details.</div>

  :::
::

::u-page-section

## Install an extension

```bash
composer require glueful/aegis
php glueful extensions:cache
php glueful extensions:list
```

For local development or explicit enable/disable flows, you can also use:

```bash
php glueful extensions:enable Aegis
php glueful extensions:disable Aegis
php glueful extensions:info Aegis
php glueful extensions:summary
```

## Related docs

- [Cookbook: Extensions](/cookbook/extensions)
- [Getting Started](/getting-started)
- [CLI Reference](/cli-reference)
::
