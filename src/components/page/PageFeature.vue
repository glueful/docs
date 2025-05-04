<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@/types/appConfig'
import type { LinkProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-feature'
import { tv } from '../utils/tv'

const appConfigPageFeature = _appConfig as AppConfig & {
  uiPro: { pageFeature: Partial<typeof theme> }
}

const pageFeature = tv({ extend: tv(theme), ...(appConfigPageFeature.uiPro?.pageFeature || {}) })

type PageFeatureVariants = VariantProps<typeof pageFeature>

export interface PageFeatureProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  icon?: string
  title?: string
  description?: string
  /**
   * The orientation of the page feature.
   * @defaultValue 'vertical'
   */
  orientation?: PageFeatureVariants['orientation']
  to?: LinkProps['to']
  target?: LinkProps['target']
  onClick?: (event: MouseEvent) => void | Promise<void>
  class?: any
  ui?: Partial<typeof pageFeature.slots>
}

export interface PageFeatureSlots {
  leading(props?: {}): any
  title(props?: {}): any
  description(props?: {}): any
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'
import { getSlotChildrenText } from '../utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PageFeatureProps>(), {
  orientation: 'horizontal',
})
const slots = defineSlots<PageFeatureSlots>()

const ui = computed(() =>
  pageFeature({
    orientation: props.orientation,
    title: !!props.title || !!slots.title,
  }),
)

const ariaLabel = computed(() =>
  (props.title || (slots.title && getSlotChildrenText(slots.title())) || 'Card link').trim(),
)
</script>

<template>
  <Primitive
    :as="as"
    :data-orientation="orientation"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
    @click="onClick"
  >
    <div v-if="icon || !!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
      <slot name="leading">
        <UIcon v-if="icon" :name="icon" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
      </slot>
    </div>

    <div :class="ui.wrapper({ class: props.ui?.wrapper })">
      <ULink
        v-if="to"
        :aria-label="ariaLabel"
        v-bind="{ to, target, ...$attrs }"
        class="focus:outline-none peer"
        tabindex="-1"
        raw
      >
        <span class="absolute inset-0" aria-hidden="true" />
      </ULink>

      <slot>
        <div v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
          <slot name="title">
            {{ title }}
          </slot>
        </div>

        <div
          v-if="description || !!slots.description"
          :class="ui.description({ class: props.ui?.description })"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </slot>
    </div>
  </Primitive>
</template>
