<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-body'
import { tv } from '../utils/tv'

const appConfigPageBody = _appConfig as AppConfig & { uiPro: { pageBody: Partial<typeof theme> } }

const pageBody = tv({ extend: tv(theme), ...(appConfigPageBody.uiPro?.pageBody || {}) })

export interface PageBodyProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
}

export interface PageBodySlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props = defineProps<PageBodyProps>()
defineSlots<PageBodySlots>()
</script>

<template>
  <Primitive :as="as" :class="pageBody({ class: props.class })">
    <slot />
  </Primitive>
</template>
