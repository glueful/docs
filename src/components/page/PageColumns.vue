<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-columns'
import { tv } from '../utils/tv'

const appConfigPageColumns = _appConfig as AppConfig & {
  uiPro: { pageColumns: Partial<typeof theme> }
}

const pageColumns = tv({ extend: tv(theme), ...(appConfigPageColumns.uiPro?.pageColumns || {}) })

export interface PageColumnsProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
}

export interface PageColumnsSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props = defineProps<PageColumnsProps>()
defineSlots<PageColumnsSlots>()
</script>

<template>
  <Primitive :as="as" :class="pageColumns({ class: props.class })">
    <slot />
  </Primitive>
</template>
