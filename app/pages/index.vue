<script setup lang="ts">
const { data: page } = await useAsyncData('landing', () => queryCollection('landing').path('/').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImageComponent('Docs', {
  headline: 'Glueful',
  title,
  description
})

// Scroll-reveal: tag elements in the markdown with `data-reveal` (fade + rise) or
// `data-reveal-stagger` (cascade their children). The hidden start state only applies
// after this arms `.reveal-ready`, so SSR / no-JS / reduced-motion renders fully visible.
onMounted(() => {
  const root = document.querySelector('.lp')
  if (!root) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return

  const targets = Array.from(
    root.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]')
  )
  if (!targets.length) return
  root.classList.add('reveal-ready')

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'))
    return
  }
  const io = new IntersectionObserver((entries, obs) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        obs.unobserve(e.target)
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })
  targets.forEach(el => io.observe(el))
})
</script>

<template>
  <div class="lp">
    <div class="lp-frame" />
    <div class="lp-grid" />
    <div class="lp-glow" />
    <ContentRenderer
      v-if="page"
      :value="page"
      :prose="false"
    />
  </div>
</template>

<!--
  prose=false (matching the real homepage) strips the prose code-block styling,
  so the hero <code-group> renders its tab bar but the code panel below loses its
  border/background. Re-complete the card here, scoped to the .hero-code wrapper.
-->
<style>
.lp { position: relative; isolation: isolate; }

/* page frame: column-edge vertical rails + diagonal hatch in the gutters (à la tailwindcss.com) */
.lp-frame {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-image: repeating-linear-gradient(-45deg, rgb(120 120 120 / 0.06) 0, rgb(120 120 120 / 0.06) 1px, transparent 1px, transparent 9px);
  -webkit-mask-image: linear-gradient(to right, #000 0, #000 calc(50% - var(--ui-container) / 2), transparent calc(50% - var(--ui-container) / 2), transparent calc(50% + var(--ui-container) / 2), #000 calc(50% + var(--ui-container) / 2), #000 100%);
  mask-image: linear-gradient(to right, #000 0, #000 calc(50% - var(--ui-container) / 2), transparent calc(50% - var(--ui-container) / 2), transparent calc(50% + var(--ui-container) / 2), #000 calc(50% + var(--ui-container) / 2), #000 100%);
}
.dark .lp-frame {
  background-image: repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.04) 0, rgb(255 255 255 / 0.04) 1px, transparent 1px, transparent 9px);
}
/* the two vertical column-edge rails */
.lp::before,
.lp::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  z-index: -2;
  pointer-events: none;
  background: rgb(120 120 120 / 0.14);
}
.lp::before { left: calc(50% - var(--ui-container) / 2); }
.lp::after { left: calc(50% + var(--ui-container) / 2); }
.dark .lp::before,
.dark .lp::after { background: rgb(255 255 255 / 0.08); }

/* faint vertical + horizontal grid — the "dev tool" texture, fading down the page */
.lp-grid {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgb(120 120 120 / 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(120 120 120 / 0.05) 1px, transparent 1px);
  background-size: 15rem 15rem;
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 92%);
  mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 92%);
}
.dark .lp-grid {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.03) 1px, transparent 1px);
}

/* soft accent glow behind the hero */
.lp-glow {
  position: absolute;
  top: -8rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(70rem, 120vw);
  height: 38rem;
  z-index: -2;
  pointer-events: none;
  background: radial-gradient(50% 50% at 50% 50%, rgb(244 63 94 / 0.16), transparent 70%);
  filter: blur(8px);
}
.dark .lp-glow { background: radial-gradient(50% 50% at 50% 50%, rgb(244 63 94 / 0.20), transparent 70%); }

/* soft radial glow behind the "Official packages" section */
.lp .pkg-glow::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 35%;
  width: min(70rem, 110%);
  height: 34rem;
  transform: translate(-50%, -50%);
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(50% 50% at 50% 50%, rgb(238 49 130 / 0.12), transparent 70%);
  filter: blur(50px);
}
.dark .lp .pkg-glow::before {
  background: radial-gradient(50% 50% at 50% 50%, rgb(238 49 130 / 0.16), transparent 70%);
}

/* tinted square behind feature-card icons */
.lp .icon-tile { background-color: rgb(238 49 130 / 0.10); }
.dark .lp .icon-tile { background-color: rgb(238 49 130 / 0.16); }

/* subtle top→bottom raspberry wash on the "one clear path" section
   (kept in CSS so the opacity isn't limited to Tailwind's 5%-step scale) */
.lp .path-fade { background-image: linear-gradient(to bottom, rgb(238 49 130 / 0.025), transparent 65%); }
.dark .lp .path-fade { background-image: linear-gradient(to bottom, rgb(238 49 130 / 0.05), transparent 65%); }

/* the .hero-code wrapper is the card (border/rounded/bg set in markdown). Let it
   and its children shrink so the code scrolls within the card instead of spilling. */
.hero-code,
.hero-code :where(div, pre) {
  min-width: 0;
  max-width: 100%;
}
/* drop the code-group's own vertical margin so the tabs touch the panel's top edge */
.hero-code [data-orientation] {
  margin: 0 !important;
}
/* editor-style file tabs: squared, divided by hairlines, on a subtle strip */
.hero-code [class*="rounded-t-md"] {
  width: 100%;
  gap: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-bottom: 1px solid rgb(128 128 128 / 0.3) !important;
  border-radius: 0 !important;
  background: rgb(249 250 251) !important;
}
.dark .hero-code [class*="rounded-t-md"] {
  background: rgb(255 255 255 / 0.03) !important;
}
.hero-code [class*="rounded-t-md"] button {
  border-radius: 0 !important;
  border-right: 1px solid rgb(128 128 128 / 0.24) !important;
  padding: 0.625rem 1rem !important;
}
/* active tab: white, sits flush with the code panel (its bottom border is erased) */
.hero-code [class*="rounded-t-md"] button[data-state="active"] {
  position: relative;
  background: #ffffff !important;
  margin-bottom: -1px !important;
  border-bottom: 1px solid #ffffff !important;
}
.dark .hero-code [class*="rounded-t-md"] button[data-state="active"] {
  background: #111827 !important;
  border-bottom-color: #111827 !important;
}
/* wrap code so there is never horizontal scroll */
.hero-code pre.shiki,
.hero-code pre.shiki code {
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  overflow-x: hidden;
}
.hero-code pre.shiki {
  padding: 1rem 1.25rem;
}

/* ---- Scroll reveal (armed by JS via .reveal-ready; SSR/no-JS = visible) ---- */
.lp.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(18px);
  will-change: opacity, transform;
}
.lp.reveal-ready [data-reveal].in {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Stagger a container's direct children — opacity only, so it never clips inside the
   overflow-hidden / gap-px card grids. */
.lp.reveal-ready [data-reveal-stagger] > * { opacity: 0; }
.lp.reveal-ready [data-reveal-stagger].in > * {
  opacity: 1;
  transition: opacity 0.5s ease, box-shadow 0.25s ease;
}
.lp.reveal-ready [data-reveal-stagger].in > *:nth-child(1) { transition-delay: 0s; }
.lp.reveal-ready [data-reveal-stagger].in > *:nth-child(2) { transition-delay: 0.07s; }
.lp.reveal-ready [data-reveal-stagger].in > *:nth-child(3) { transition-delay: 0.14s; }
.lp.reveal-ready [data-reveal-stagger].in > *:nth-child(4) { transition-delay: 0.21s; }
.lp.reveal-ready [data-reveal-stagger].in > *:nth-child(5) { transition-delay: 0.28s; }
.lp.reveal-ready [data-reveal-stagger].in > *:nth-child(6) { transition-delay: 0.35s; }
.lp.reveal-ready [data-reveal-stagger].in > *:nth-child(n + 7) { transition-delay: 0.42s; }

/* ---- Tier 2: card hover accent (inset ring — no layout shift, clip-safe) + icon nudge ---- */
.lp .reveal-cards > * {
  transition: box-shadow 0.25s ease;
}
.lp .reveal-cards > *:hover {
  box-shadow: inset 0 0 0 1px rgb(238 49 130 / 0.28);
}
.lp .reveal-cards > *:hover .icon-tile {
  transform: scale(1.06);
  transition: transform 0.25s ease;
}
/* primary CTAs: nudge the trailing icon on hover */
.lp a.bg-raspberry-500 :where([class*="i-lucide-rocket"], [class*="i-lucide-arrow"]) {
  transition: transform 0.2s ease;
}
.lp a.bg-raspberry-500:hover :where([class*="i-lucide-rocket"], [class*="i-lucide-arrow"]) {
  transform: translateX(2px);
}

@media (prefers-reduced-motion: reduce) {
  .lp.reveal-ready [data-reveal],
  .lp.reveal-ready [data-reveal-stagger] > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
