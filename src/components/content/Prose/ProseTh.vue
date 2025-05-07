<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/th'
import { tv } from '../../utils/tv'

const appConfigProseTh = _appConfig as AppConfig & {
  uiPro: { prose: { th: Partial<typeof theme> } }
}

const proseTh = tv({ extend: tv(theme), ...(appConfigProseTh.uiPro?.prose?.th || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <th :class="proseTh({ class: props.class })">
    <slot />
  </th>
</template>
