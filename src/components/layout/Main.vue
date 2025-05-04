<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/main'
import { tv } from '../utils/tv'

const appConfigMain = _appConfig as AppConfig & { uiPro: { main: Partial<typeof theme> } }

const main = tv({ extend: tv(theme), ...(appConfigMain.uiPro?.main || {}) })

export interface MainProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'main'
   */
  as?: any
  class?: any
}

export interface MainSlots {
  default(props?: object): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props = withDefaults(defineProps<MainProps>(), {
  as: 'main',
})
defineSlots<MainSlots>()
</script>

<template>
  <Primitive :as="as" :class="main({ class: props.class })">
    <slot />
  </Primitive>
</template>
