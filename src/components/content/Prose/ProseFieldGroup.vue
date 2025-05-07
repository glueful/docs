<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/field-group'
import { tv } from '../../utils/tv'

const appConfigFieldGroup = _appConfig as AppConfig & {
  uiPro: { prose: { fieldGroup: Partial<typeof theme> } }
}

const fieldGroup = tv({
  extend: tv(theme),
  ...(appConfigFieldGroup.uiPro?.prose?.fieldGroup || {}),
})

export interface FieldGroupProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
}

export interface FieldGroupSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props = defineProps<FieldGroupProps>()
defineSlots<FieldGroupSlots>()
</script>

<template>
  <Primitive :as="as" :class="fieldGroup({ class: props.class })">
    <slot />
  </Primitive>
</template>
