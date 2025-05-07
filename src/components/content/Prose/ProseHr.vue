<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/hr'
import { tv } from '../../utils/tv'

const appConfigProseHr = _appConfig as AppConfig & {
  uiPro: { prose: { hr: Partial<typeof theme> } }
}

const proseHr = tv({ extend: tv(theme), ...(appConfigProseHr.uiPro?.prose?.hr || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <hr :class="proseHr({ class: props.class })" />
</template>
