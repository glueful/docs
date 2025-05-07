<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/blockquote'
import { tv } from '../../utils/tv'

const appConfigProseBlockquote = _appConfig as AppConfig & {
  uiPro: { prose: { blockquote: Partial<typeof theme> } }
}

const proseBlockquote = tv({
  extend: tv(theme),
  ...(appConfigProseBlockquote.uiPro?.prose?.blockquote || {}),
})
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <blockquote :class="proseBlockquote({ class: props.class })">
    <slot />
  </blockquote>
</template>
