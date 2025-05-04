<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/footer'
import { tv } from '../utils/tv'

const appConfigFooter = _appConfig as AppConfig & { uiPro: { footer: Partial<typeof theme> } }

const footer = tv({ extend: tv(theme), ...(appConfigFooter.uiPro?.footer || {}) })

export interface FooterProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'footer'
   */
  as?: any
  class?: any
  ui?: Partial<typeof footer.slots>
}

export interface FooterSlots {
  left(props?: {}): any
  default(props?: {}): any
  right(props?: {}): any
  top(props?: {}): any
  bottom(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props: any = withDefaults(defineProps<FooterProps>(), {
  as: 'footer',
})
const slots = defineSlots<FooterSlots>()

// eslint-disable-next-line vue/no-dupe-keys
const ui: any = footer()
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div v-if="!!slots.top" :class="ui.top({ class: props.ui?.top })">
      <slot name="top" />
    </div>

    <UContainer :class="ui.container({ class: props.ui?.container })">
      <div :class="ui.right({ class: props.ui?.right })">
        <slot name="right" />
      </div>

      <div :class="ui.center({ class: props.ui?.center })">
        <slot />
      </div>

      <div :class="ui.left({ class: props.ui?.left })">
        <slot name="left" />
      </div>
    </UContainer>

    <div v-if="!!slots.bottom" :class="ui.bottom({ class: props.ui?.bottom })">
      <slot name="bottom" />
    </div>
  </Primitive>
</template>
