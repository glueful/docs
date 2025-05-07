<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/thead'
import { tv } from '../../utils/tv'

const appConfigProseThead = _appConfig as AppConfig & {
  uiPro: { prose: { thead: Partial<typeof theme> } }
}

const proseThead = tv({ extend: tv(theme), ...(appConfigProseThead.uiPro?.prose?.thead || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <thead :class="proseThead({ class: props.class })">
    <slot />
  </thead>
</template>
