<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/ul'
import { tv } from '../../utils/tv'

const appConfigProseUl = _appConfig as AppConfig & {
  uiPro: { prose: { ul: Partial<typeof theme> } }
}

const proseUl = tv({ extend: tv(theme), ...(appConfigProseUl.uiPro?.prose?.ul || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <ul :class="proseUl({ class: props.class })">
    <slot />
  </ul>
</template>
