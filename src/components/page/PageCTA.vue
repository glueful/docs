<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@/types/appConfig'
import type { ButtonProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-cta'
import { tv } from '../utils/tv'

const appConfigPageCTA = _appConfig as AppConfig & { uiPro: { pageCTA: Partial<typeof theme> } }

const pageCTA = tv({ extend: tv(theme), ...(appConfigPageCTA.uiPro?.pageCTA || {}) })

type PageCTAVariants = VariantProps<typeof pageCTA>

export interface PageCTAProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
  title?: string
  description?: string
  /**
   * The orientation of the page cta.
   * @defaultValue 'vertical'
   */
  orientation?: PageCTAVariants['orientation']
  /**
   * Reverse the order of the default slot.
   * @defaultValue false
   */
  reverse?: boolean
  variant?: PageCTAVariants['variant']
  /**
   * Display a list of Button under the description.
   * `{ size: 'lg' }`{lang="ts-type"}
   */
  links?: ButtonProps[]
  ui?: Partial<typeof pageCTA.slots>
}

export interface PageCTASlots {
  default(props?: {}): any
  title(props?: {}): any
  description(props?: {}): any
  links(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'

const props = withDefaults(defineProps<PageCTAProps>(), {
  orientation: 'vertical',
  reverse: false,
})
const slots = defineSlots<PageCTASlots>()

const ui = computed(() =>
  pageCTA({
    variant: props.variant,
    orientation: props.orientation,
    reverse: props.reverse,
    title: !!props.title || !!slots.title,
  }),
)
</script>

<template>
  <Primitive
    :as="as"
    :data-orientation="orientation"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
  >
    <UContainer :class="ui.container({ class: props.ui?.container })">
      <div :class="ui.wrapper({ class: props.ui?.wrapper })">
        <h2 v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
          <slot name="title">
            {{ title }}
          </slot>
        </h2>

        <div
          v-if="description || !!slots.description"
          :class="ui.description({ class: props.ui?.description })"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </div>

        <div v-if="links?.length || !!slots.links" :class="ui.links({ class: props.ui?.links })">
          <slot name="links">
            <UButton v-for="(link, index) in links" :key="index" size="lg" v-bind="link" />
          </slot>
        </div>
      </div>

      <slot v-if="!!slots.default" />
      <div v-else-if="orientation === 'horizontal'" class="hidden lg:block" />
    </UContainer>
  </Primitive>
</template>
