<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@/types/appConfig'
import type { ButtonProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-hero'
import { tv } from '../utils/tv'

const appConfigPageHero = _appConfig as AppConfig & { uiPro: { pageHero: Partial<typeof theme> } }

const pageHero = tv({ extend: tv(theme), ...(appConfigPageHero.uiPro?.pageHero || {}) })

type PageHeroVariants = VariantProps<typeof pageHero>

export interface PageHeroProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  headline?: string
  title?: string
  description?: string
  /**
   * Display a list of Button under the description.
   * `{ size: 'xl' }`{lang="ts-type"}
   */
  links?: ButtonProps[]
  /**
   * The orientation of the page hero.
   * @defaultValue 'vertical'
   */
  orientation?: PageHeroVariants['orientation']
  /**
   * Reverse the order of the default slot.
   * @defaultValue false
   */
  reverse?: boolean
  class?: any
  ui?: Partial<typeof pageHero.slots>
}

export interface PageHeroSlots {
  default(props?: {}): any
  top(props?: {}): any
  bottom(props?: {}): any
  headline(props?: {}): any
  title(props?: {}): any
  description(props?: {}): any
  links(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'

const props = withDefaults(defineProps<PageHeroProps>(), {
  orientation: 'vertical',
})
const slots = defineSlots<PageHeroSlots>()

const ui = computed(() =>
  pageHero({
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
    <slot name="top" />

    <UContainer :class="ui.container({ class: props.ui?.container })">
      <div :class="ui.wrapper({ class: props.ui?.wrapper })">
        <div
          v-if="headline || !!slots.headline"
          :class="ui.headline({ class: props.ui?.headline, headline: !slots.headline })"
        >
          <slot name="headline">
            {{ headline }}
          </slot>
        </div>

        <h1 v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
          <slot name="title">
            {{ title }}
          </slot>
        </h1>

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
            <UButton v-for="(link, index) in links" :key="index" size="xl" v-bind="link" />
          </slot>
        </div>
      </div>

      <slot v-if="!!slots.default" />
      <div v-else-if="orientation === 'horizontal'" class="hidden lg:block" />
    </UContainer>

    <slot name="bottom" />
  </Primitive>
</template>
