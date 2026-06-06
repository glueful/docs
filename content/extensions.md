---
title: Extensions
description: Official Glueful extensions for identity/accounts, RBAC, SSO, email, push, SMS/WhatsApp, search, payments, and runtime integrations.
---

::u-page-section

#title
<span class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted">
  Extend <span class="text-raspberry-600">Glueful</span> without bloating the core
</span>

#description
<div class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
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

#title
<span class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted">
  Official packages
</span>

#description
<div class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
  These packages are part of the current Glueful ecosystem and cover common product needs that many API teams want to add without building them from scratch.
</div>

<div class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
  <div class="rounded-2xl border border-indigo-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Users</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">First-party identity store and account lifecycle — the concrete user provider behind Glueful's auth contracts: <code>users</code>/<code>profiles</code> tables, credential verification, email verification and OTP, password reset, optional email-PIN 2FA, and the account endpoints (<code>/me</code>, <code>/users</code>). Core ships no user store of its own, so install this (or another <code>UserProviderInterface</code>) to enable authentication. The api-skeleton enables it by default.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">Identity</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Accounts</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">2FA</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/users" target="_blank" rel="noopener">glueful/users</a>
  </div>

  <div class="rounded-2xl border border-raspberry-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-raspberry-50 text-raspberry-600 dark:bg-raspberry-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Aegis</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Role-based access control for Glueful with roles, permissions, and authorization workflows without building your own RBAC layer.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-raspberry-50 px-3 py-1 text-raspberry-700 dark:bg-raspberry-500/10 dark:text-raspberry-300">RBAC</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Permissions</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Access Control</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/aegis" target="_blank" rel="noopener">glueful/aegis</a>
  </div>

  <div class="rounded-2xl border border-azure-radiance-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-azure-radiance-50 text-azure-radiance-600 dark:bg-azure-radiance-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Entrada</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Social login and SSO integration for OAuth and OpenID Connect flows when your API needs identity federation and external providers.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-azure-radiance-50 px-3 py-1 text-azure-radiance-700 dark:bg-azure-radiance-500/10 dark:text-azure-radiance-300">OAuth</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">OIDC</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">SSO</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/entrada" target="_blank" rel="noopener">glueful/entrada</a>
  </div>

  <div class="rounded-2xl border border-amber-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Email Notification</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Email delivery capabilities built on Symfony Mailer for transactional notifications, account flows, and outbound messaging.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Email</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Mailer</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Notifications</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/email-notification" target="_blank" rel="noopener">glueful/email-notification</a>
  </div>

  <div class="rounded-2xl border border-violet-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Notiva</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Push notifications for FCM, APNs, and Web Push when your platform needs multi-device delivery beyond email.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-violet-50 px-3 py-1 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">FCM</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">APNs</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Web Push</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/notiva" target="_blank" rel="noopener">glueful/notiva</a>
  </div>

  <div class="rounded-2xl border border-green-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Conversa</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">SMS and WhatsApp messaging channels backed by swappable provider drivers (Twilio, Meta WhatsApp Cloud) with a message log, delivery webhooks, and templates.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-green-50 px-3 py-1 text-green-700 dark:bg-green-500/10 dark:text-green-300">SMS</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">WhatsApp</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Twilio</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/conversa" target="_blank" rel="noopener">glueful/conversa</a>
  </div>

  <div class="rounded-2xl border border-emerald-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Meilisearch</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Full-text search integration for applications that need fast external indexing, search endpoints, and richer query experiences.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Search</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Indexing</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Meilisearch</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/meilisearch" target="_blank" rel="noopener">glueful/meilisearch</a>
  </div>

  <div class="rounded-2xl border border-teal-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Payvia</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Unified payment gateway bridge for Stripe, Paystack, Flutterwave, and other payment flows so billing logic is easier to standardize.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-teal-50 px-3 py-1 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">Payments</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Gateways</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Billing</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/payvia" target="_blank" rel="noopener">glueful/payvia</a>
  </div>

  <div class="rounded-2xl border border-sky-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
    <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10">
      <span class="i-lucide-box h-6 w-6 block"></span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Runiva</h3>
    <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Server runtime integration for RoadRunner, Swoole, and FrankenPHP for teams running long-lived PHP application processes.</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs">
      <span class="rounded-full bg-sky-50 px-3 py-1 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">RoadRunner</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">Swoole</span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">FrankenPHP</span>
    </div>
    <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-azure-radiance-600 hover:text-azure-radiance-700" href="https://packagist.org/packages/glueful/runiva" target="_blank" rel="noopener">glueful/runiva</a>
  </div>
</div>
::

::u-page-section

#title
<span class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted">
  Local and custom extensions
</span>

#description
<div class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
  The local repository also includes extension packages used for active Glueful development and integration work.
</div>

#features
  :::u-page-feature

  #title
  <span class="font-bold text-raspberry-600">Build Your Own</span>

  #description
  <div>Glueful’s extension system supports local packages with providers, routes, config, migrations, and commands. See the extension cookbook page for creation and packaging details.</div>

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
