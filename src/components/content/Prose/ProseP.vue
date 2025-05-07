<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/p'
import { tv } from '../../utils/tv'

const appConfigProseP = _appConfig as AppConfig & { uiPro: { prose: { p: Partial<typeof theme> } } }

const proseP = tv({ extend: tv(theme), ...(appConfigProseP.uiPro?.prose?.p || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <p :class="proseP({ class: props.class })">
    <slot />
  </p>
</template>
