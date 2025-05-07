<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/td'
import { tv } from '../../utils/tv'

const appConfigProseTd = _appConfig as AppConfig & {
  uiPro: { prose: { td: Partial<typeof theme> } }
}

const proseTd = tv({ extend: tv(theme), ...(appConfigProseTd.uiPro?.prose?.td || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <td :class="proseTd({ class: props.class })">
    <slot />
  </td>
</template>
