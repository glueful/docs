<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/code'
import { tv } from '../../utils/tv'

const appConfigProseCode = _appConfig as AppConfig & {
  uiPro: { prose: { code: Partial<typeof theme> } }
}

const proseCode = tv({ extend: tv(theme), ...(appConfigProseCode.uiPro?.prose?.code || {}) })

type CodeVariants = VariantProps<typeof proseCode>

interface CodeProps {
  lang?: string
  color?: CodeVariants['color']
  class?: any
}
</script>

<script setup lang="ts">
const props = defineProps<CodeProps>()
</script>

<template>
  <code :class="proseCode({ class: (props.class || '').split(',').join(' '), color: props.color })">
    <slot />
  </code>
</template>
