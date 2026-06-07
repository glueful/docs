<script setup lang="ts">
/**
 * Scroll-reveal wrapper for use in markdown (`::motion-reveal`).
 *
 * It only renders the marker attribute the landing page's IntersectionObserver
 * (see `app/pages/index.vue`) looks for — `data-reveal` (fade + rise) or, with
 * `stagger`, `data-reveal-stagger` (cascade direct children). The hidden start
 * state is applied by that observer once it arms `.reveal-ready`, so SSR / no-JS
 * / reduced-motion render fully visible — content can never get stuck hidden.
 *
 * Usage:
 *   ::motion-reveal
 *   …block…
 *   ::
 *
 *   ::motion-reveal{stagger}
 *   …grid whose children should cascade…
 *   ::
 */
withDefaults(defineProps<{ stagger?: boolean }>(), { stagger: false })
</script>

<template>
  <div
    :data-reveal="stagger ? undefined : ''"
    :data-reveal-stagger="stagger ? '' : undefined"
  >
    <slot />
  </div>
</template>
