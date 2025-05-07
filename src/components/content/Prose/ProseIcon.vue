<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/icon'
import { tv } from '../../utils/tv'

const appConfigProseIcon = _appConfig as AppConfig & {
  uiPro: { prose: { icon: Partial<typeof theme> } }
}

const icon = tv({ extend: tv(theme), ...(appConfigProseIcon.uiPro?.prose?.icon || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  name: string
  class?: any
}>()
</script>

<template>
  <UIcon :name="name" :class="icon({ class: props.class })" />
</template>
