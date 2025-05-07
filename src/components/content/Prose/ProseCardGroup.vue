<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/card-group'
import { tv } from '../../utils/tv'

const appConfigProseCardGroup = _appConfig as AppConfig & {
  uiPro: { prose: { cardGroup: Partial<typeof theme> } }
}

const cardGroup = tv({
  extend: tv(theme),
  ...(appConfigProseCardGroup.uiPro?.prose?.cardGroup || {}),
})
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cardGroup({ class: props.class })">
    <slot />
  </div>
</template>
