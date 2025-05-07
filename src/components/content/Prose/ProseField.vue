<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/field'
import { tv } from '../../utils/tv'

const appConfigField = _appConfig as AppConfig & {
  uiPro: { prose: { field: Partial<typeof theme> } }
}

const field = tv({ extend: tv(theme), ...(appConfigField.uiPro?.prose?.field || {}) })

export interface FieldProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  /**
   * The name of the field.
   */
  name: string
  /**
   * Expected type of the field’s value
   */
  type: string
  /**
   * Description of the field
   */
  description?: string
  /**
   * Indicate whether the field is required
   */
  required?: boolean
  class?: any
  ui?: Partial<typeof field.slots>
}

export interface FieldSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'

const props = defineProps<FieldProps>()
const slots = defineSlots<FieldSlots>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = field()
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <span v-if="name" :class="ui.name({ class: props.ui?.name })">
        {{ name }}
      </span>

      <div :class="ui.wrapper({ class: props.ui?.wrapper })">
        <span v-if="type" :class="ui.type({ class: props.ui?.type })">
          {{ type }}
        </span>

        <span v-if="required" :class="ui.required({ class: props.ui?.required })"> required </span>
      </div>
    </div>

    <p
      v-if="!!slots.default || description"
      :class="ui.description({ class: props.ui?.description })"
    >
      <slot mdc-unwrap="p">
        {{ description }}
      </slot>
    </p>
  </Primitive>
</template>
