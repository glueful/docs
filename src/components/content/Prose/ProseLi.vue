<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/li'
import { tv } from '../../utils/tv'

const appConfigProseLi = _appConfig as AppConfig & {
  uiPro: { prose: { li: Partial<typeof theme> } }
}

const proseLi = tv({ extend: tv(theme), ...(appConfigProseLi.uiPro?.prose?.li || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <li :class="proseLi({ class: props.class })">
    <slot />
  </li>
</template>
