<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/steps'
import { tv } from '../../utils/tv'

const appConfigProseSteps = _appConfig as AppConfig & {
  uiPro: { prose: { steps: Partial<typeof theme> } }
}

const steps = tv({ extend: tv(theme), ...(appConfigProseSteps.uiPro?.prose?.steps || {}) })

type StepsVariants = VariantProps<typeof steps>

interface StepsProps {
  level?: StepsVariants['level']
  class?: any
}
</script>

<script setup lang="ts">
const props = defineProps<StepsProps>()
</script>

<template>
  <div :class="steps({ class: props.class, level: props.level })">
    <slot />
  </div>
</template>
