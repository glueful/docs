<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-grid'
import { tv } from '../utils/tv'

const appConfigPageGrid = _appConfig as AppConfig & { uiPro: { pageGrid: Partial<typeof theme> } }

const pageGrid = tv({ extend: tv(theme), ...(appConfigPageGrid.uiPro?.pageGrid || {}) })

export interface PageGridProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
}

export interface PageGridSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props = defineProps<PageGridProps>()
defineSlots<PageGridSlots>()
</script>

<template>
  <Primitive :as="as" :class="pageGrid({ class: props.class })">
    <slot />
  </Primitive>
</template>
