<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/kbd'
import { tv } from '../../utils/tv'

const appConfigProseKbd = _appConfig as AppConfig & {
  uiPro: { prose: { kbd: Partial<typeof theme> } }
}

const proseKbd = tv({ extend: tv(theme), ...(appConfigProseKbd.uiPro?.prose?.kbd || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  value: string
  class?: any
}>()
</script>

<template>
  <UKbd :value="value" :class="proseKbd({ class: props.class })" />
</template>
