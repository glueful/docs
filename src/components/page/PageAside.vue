<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-aside'
import { tv } from '../utils/tv'

const appConfigPageAside = _appConfig as AppConfig & { uiPro: { pageAside: Partial<typeof theme> } }

const pageAside = tv({ extend: tv(theme), ...(appConfigPageAside.uiPro?.pageAside || {}) })

export interface PageAsideProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'aside'
   */
  as?: any
  class?: any
  ui?: Partial<typeof pageAside.slots>
}

export interface PageAsideSlots {
  top(props?: {}): any
  default(props?: {}): any
  bottom(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props = withDefaults(defineProps<PageAsideProps>(), {
  as: 'aside',
})
const slots = defineSlots<PageAsideSlots>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = pageAside()
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <div v-if="!!slots.top" :class="ui.top({ class: props.ui?.top })">
        <div :class="ui.topHeader({ class: props.ui?.topHeader })" />
        <div :class="ui.topBody({ class: props.ui?.topBody })">
          <slot name="top" />
        </div>
        <div :class="ui.topFooter({ class: props.ui?.topFooter })" />
      </div>

      <slot />

      <slot name="bottom" />
    </div>
  </Primitive>
</template>
