<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/ol'
import { tv } from '../../utils/tv'

const appConfigProseOl = _appConfig as AppConfig & {
  uiPro: { prose: { ol: Partial<typeof theme> } }
}

const proseOl = tv({ extend: tv(theme), ...(appConfigProseOl.uiPro?.prose?.ol || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <ol :class="proseOl({ class: props.class })">
    <slot />
  </ol>
</template>
