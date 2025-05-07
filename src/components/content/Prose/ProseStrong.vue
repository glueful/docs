<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/strong'
import { tv } from '../../utils/tv'

const appConfigProseStrong = _appConfig as AppConfig & {
  uiPro: { prose: { strong: Partial<typeof theme> } }
}

const proseStrong = tv({ extend: tv(theme), ...(appConfigProseStrong.uiPro?.prose?.strong || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <strong :class="proseStrong({ class: props.class })">
    <slot />
  </strong>
</template>
