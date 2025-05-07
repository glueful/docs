<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/a'
import { tv } from '../../utils/tv'

const appConfigProseA = _appConfig as AppConfig & { uiPro: { prose: { a: Partial<typeof theme> } } }

const proseA = tv({ extend: tv(theme), ...(appConfigProseA.uiPro?.prose?.a || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined
  class?: any
}>()
</script>

<template>
  <ULink :href="href" :target="target" :class="proseA({ class: props.class })" raw>
    <slot />
  </ULink>
</template>
