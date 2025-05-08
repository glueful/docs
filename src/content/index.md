---
seo:
  title: Modern API Development, Simplified
  description: Nuxt UI Pro is a collection of premium Vue components built on top
    of Nuxt UI to create beautiful & responsive Nuxt applications in minutes.
---

::page-hero{class="home-page-hero"}

#headline
<span class="font-bold">Glueful</span>

#title
<span class="font-normal text-primary-600">Modern API Development, <span class="text-primary-500 font-medium">Simplified</span></span>

#description
Glueful is a modern, secure, and scalable PHP API framework designed for building robust applications. With its powerful extension system, comprehensive security features, and developer-friendly tools, Glueful helps you create production-ready APIs in less time.

#links
  :::u-button
  ---
  size: xl
  to: /getting-started
  trailing-icon: i-lucide-arrow-right
  color: neutral
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  icon: i-tabler-brand-github-filled
  size: xl
  target: _blank
  to: https://github.com/glueful
  variant: subtle
  ---
  :::


::div{class="hidden lg:block absolute top-20 left-15 -z-1"}
::img{src="/images/light/line-1.svg" alt="Line" class="aabsolute pointer-events-none pb-10 left-0 top-0 object-cover h-[650px]" alt="Line Decoration"}
::
::

::page-section{class="isolate relative overflow-hidden"}

#title

<h2 class="text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted text-left @container relative flex">
<div class="*:leading-9">
<p class="my-5 leading-7 text-pretty font-normal text-primary-600">Why developers choose <span class="text-primary-500 font-medium">Glueful</span></p>
</div>
<div class="hidden @min-[1020px]:block">
<img  class="absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]" src="/images/light/line-2.svg" alt="Line Decoration"/>
</div>
</h2>

#description

<div class="text-base sm:text-lg text-(--ui-text-muted) text-left text-balance mt-6"><p>Glueful helps you create production-ready APIs in less time.</p></div>

#features
:::page-feature{icon="i-lucide-layers"}
#title
<span class="font-bold">Modern Architecture</span>

#description

  <div>Built for PHP 8.2+ with modern coding practices, PSR-15 middleware system, and RESTful endpoints that automatically generate OpenAPI documentation.</div>
  :::

:::page-feature{icon="i-lucide-shield-check"}
#title
<span class="font-bold">Comprehensive Security</span>

#description

  <div>Built-in RBAC, JWT authentication, audit logging for security-critical operations, rate limiting, and SQL injection protection with prepared statements.</div>
  :::

:::page-feature{icon="i-tabler-tool"}
#title
<span class="font-bold">Developer Experiencee</span>

#description

<div>Powerful CLI tools, database migrations, automatic API documentation, extension marketplace, and comprehensive error logging and debugging.</div>
::

::page-section{orientation = "horizontal"}
<img  class="absolute -top-10 sm:top-0 right-1/2 h-24" src="/images/light/line-3.svg" alt="Line Decoration" />

::prose-pre{code = "php glueful extensions create MyExtension" filename = "Terminal"}

```bash
# Create a new extension
php glueful extensions create MyExtension

# Enable your extension
php glueful extensions enable MyExtension
```

::

#title
<span class="leading-7 text-pretty font-normal text-primary-600"><span class="text-primary-500 font-medium">Extensible</span> by design</span>

#description

<div>Glueful's powerful extension system allows you to easily add new features to your API without modifying core code. Leverage the extension marketplace to find and share reusable components for common API functionality.</div>

::

::page-section{class="relative overflow-x-hidden"}

<!-- <div class="absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary blur-[200px]"></div> -->
<!-- <div class="absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary blur-[200px]"></div> -->

#title
<h2 class="mt-12 mb-6 scroll-mt-[calc(48px+45px+var(--ui-header-height))] lg:scroll-mt-[calc(48px+var(--ui-header-height))] [&>a]:focus-visible:outline-(--ui-primary) [&>a>code]:border-dashed hover:[&>a>code]:border-(--ui-primary) hover:[&>a>code]:text-(--ui-primary) [&>a>code]:text-xl/7 [&>a>code]:font-bold [&>a>code]:transition-colors text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted text-left @container relative flex">
  <div class="*:leading-9">
    <p class="my-5 leading-7 text-pretty font-normal text-primary-600">Ready-to-Use <span class="text-primary-500 font-medium">API Endpoints</span></p>
  </div>
  <div class="hidden @min-[1020px]:block"><img src="/images/light/line-2.svg" alt="Line Decoration" class="absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]" alt="line-2"></div>
</h2>

#description

<div class="text-left">Glueful provides a comprehensive set of RESTful API endpoints out-of-the-box. Additionally, with a simple command, you can automatically generate RESTful CRUD API endpoints for every table in your database, saving hours of development time and ensuring consistent API design.</div>

<div class="flex items-center gap-1.5 bg-default relative rounded-t-md px-4 py-3 justify-between">
<div class="flex items-center gap-2">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 17l6-6l-6-6m8 14h8"/></svg>
<span class="text-default text-sm/6"> php glueful generate:json api-definitions</span>
</div>
</div>

::

::u-separator{class="border-primary/30"}
::

  ::u-page-section
 
  :::u-page-c-t-a
  ---
  links:
    - label:  Get started
      to: /getting-started
      trailing-icon: i-lucide-arrow-right
      color: neutral
      size: xl
    - label: ''
      to: https://github.com/glueful
      icon: i-tabler-brand-github-filled
      target: _blank
      color: neutral
      size: xl
      variant: subtle
  description: Glueful simplifies API development with intuitive syntax and powerful tools—perfect for projects big or small. Get started in minutes and focus on what matters- building great applications.
  variant: ghost
  ---

  <div class="hidden lg:block"><img src="/images/light/line-7.svg" alt="Line Decoration" class="absolute right-0 bottom-0 h-full" alt="line-7"></div>

  #title
  <spna class="leading-7 text-pretty font-normal text-left">Build Better <span class="text-primary-500 font-medium">APIs</span> is easy<span>

  :::
::

::u-separator{class="border-primary/30"}
::
