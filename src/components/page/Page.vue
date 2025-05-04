<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page'
import { tv } from '../utils/tv'

const appConfigPage = _appConfig as AppConfig & { uiPro: { page: Partial<typeof theme> } }

const page = tv({ extend: tv(theme), ...(appConfigPage.uiPro?.page || {}) })

export interface PageProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
  ui?: Partial<typeof page.slots>
}

export interface PageSlots {
  left(props?: {}): any
  default(props?: {}): any
  right(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Primitive, Slot } from 'reka-ui'

const props = defineProps<PageProps>()
const slots = defineSlots<PageSlots>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() =>
  page({
    left: !!slots.left,
    right: !!slots.right,
  }),
)
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <Slot v-if="!!slots.left" :class="ui.left({ class: props.ui?.left })">
      <slot name="left" />
    </Slot>

    <div :class="ui.center({ class: props.ui?.center })">
      <slot />
    </div>

    <Slot v-if="!!slots.right" :class="ui.right({ class: props.ui?.right })">
      <slot name="right" />
    </Slot>
  </Primitive>
</template>
