<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/tbody'
import { tv } from '../../utils/tv'

const appConfigProseTbody = _appConfig as AppConfig & {
  uiPro: { prose: { tbody: Partial<typeof theme> } }
}

const proseTbody = tv({ extend: tv(theme), ...(appConfigProseTbody.uiPro?.prose?.tbody || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <tbody :class="proseTbody({ class: props.class })">
    <slot />
  </tbody>
</template>
