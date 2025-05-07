<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/tabs-item'
import { tv } from '../../utils/tv'

const appConfigProseTabsItem = _appConfig as AppConfig & {
  uiPro: { prose: { tabsItem: Partial<typeof theme> } }
}

const tabsItem = tv({ extend: tv(theme), ...(appConfigProseTabsItem.uiPro?.prose?.tabsItem || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  label: string
  class?: any
}>()
</script>

<template>
  <div :class="tabsItem({ class: props.class })">
    <slot mdc-unwrap="p" />
  </div>
</template>
