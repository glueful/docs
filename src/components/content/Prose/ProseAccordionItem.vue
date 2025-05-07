<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/accordion-item'
import { tv } from '../../utils/tv'

const appConfigProseAccordionItem = _appConfig as AppConfig & {
  uiPro: { prose: { accordionItem: Partial<typeof theme> } }
}

const accordionItem = tv({
  extend: tv(theme),
  ...(appConfigProseAccordionItem.uiPro?.prose?.accordionItem || {}),
})
</script>

<script setup lang="ts">
const props = defineProps<{
  label: string
  class?: any
}>()
</script>

<template>
  <p :class="accordionItem({ class: props.class })">
    <slot mdc-unwrap="p" />
  </p>
</template>
