<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/tr'
import { tv } from '../../utils/tv'

const appConfigProseTr = _appConfig as AppConfig & {
  uiPro: { prose: { tr: Partial<typeof theme> } }
}

const proseTr = tv({ extend: tv(theme), ...(appConfigProseTr.uiPro?.prose?.tr || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <tr :class="proseTr({ class: props.class })">
    <slot />
  </tr>
</template>
