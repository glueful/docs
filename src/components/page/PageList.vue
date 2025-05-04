<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-list'
import { tv } from '../utils/tv'

const appConfigPageList = _appConfig as AppConfig & { uiPro: { pageList: Partial<typeof theme> } }

const pageList = tv({ extend: tv(theme), ...(appConfigPageList.uiPro?.pageList || {}) })

export interface PageListProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'ul'
   */
  as?: any
  divide?: boolean
  class?: any
}

export interface PageListSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive, Slot } from 'reka-ui'

const props = withDefaults(defineProps<PageListProps>(), {
  as: 'ul',
  divide: false,
})
defineSlots<PageListSlots>()
</script>

<template>
  <Primitive :as="as" role="list" :class="pageList({ class: props.class, divide: props.divide })">
    <Slot orientation="horizontal" as="li">
      <slot />
    </Slot>
  </Primitive>
</template>
