<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/em'
import { tv } from '../../utils/tv'

const appConfigProseEm = _appConfig as AppConfig & {
  uiPro: { prose: { em: Partial<typeof theme> } }
}

const proseEm = tv({ extend: tv(theme), ...(appConfigProseEm.uiPro?.prose?.em || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <em :class="proseEm({ class: props.class })"><slot /></em>
</template>
