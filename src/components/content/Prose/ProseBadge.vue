<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/badge'
import { tv } from '../../utils/tv'

const appConfigProseBadge = _appConfig as AppConfig & {
  uiPro: { prose: { badge: Partial<typeof theme> } }
}

const badge = tv({ extend: tv(theme), ...(appConfigProseBadge.uiPro?.prose?.badge || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: any
}>()
</script>

<template>
  <UBadge color="primary" variant="subtle" :class="badge({ class: props.class })">
    <slot mdc-unwrap="p" />
  </UBadge>
</template>
