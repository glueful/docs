<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@/types/appConfig'
import type { LinkProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-card'
import { tv } from '../utils/tv'

const appConfigPageCard = _appConfig as AppConfig & { uiPro: { pageCard: Partial<typeof theme> } }

const pageCard = tv({ extend: tv(theme), ...(appConfigPageCard.uiPro?.pageCard || {}) })

type PageCardVariants = VariantProps<typeof pageCard>

export interface PageCardProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  icon?: string
  title?: string
  description?: string
  /**
   * The orientation of the page card.
   * @defaultValue 'vertical'
   */
  orientation?: PageCardVariants['orientation']
  /**
   * Reverse the order of the default slot.
   * @defaultValue false
   */
  reverse?: boolean
  /**
   * Display a line around the page card.
   */
  highlight?: boolean
  /**
   * Display a spotlight effect that follows your mouse cursor and highlights borders on hover.
   */
  spotlight?: boolean
  variant?: PageCardVariants['variant']
  to?: LinkProps['to']
  target?: LinkProps['target']
  onClick?: (event: MouseEvent) => void | Promise<void>
  class?: any
  ui?: Partial<typeof pageCard.slots>
}

export interface PageCardSlots {
  header(props?: {}): any
  body(props?: {}): any
  leading(props?: {}): any
  title(props?: {}): any
  description(props?: {}): any
  footer(props?: {}): any
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Primitive } from 'reka-ui'
import { useMouseInElement, pausableFilter } from '@vueuse/core'
import { getSlotChildrenText } from '../utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PageCardProps>(), {
  orientation: 'vertical',
})
const slots = defineSlots<PageCardSlots>()

const cardRef = ref<HTMLElement>()
const motionControl = pausableFilter()

const { elementX, elementY } = useMouseInElement(cardRef, {
  eventFilter: motionControl.eventFilter,
})

const spotlight = computed(() => props.spotlight && (elementX.value > 0 || elementY.value > 0))

watch(
  () => props.spotlight,
  (value) => {
    if (value) {
      motionControl.resume()
    } else {
      motionControl.pause()
    }
  },
  { immediate: true },
)

const ui = computed(() =>
  pageCard({
    orientation: props.orientation,
    reverse: props.reverse,
    variant: props.variant,
    to: !!props.to || !!props.onClick,
    title: !!props.title || !!slots.title,
    highlight: props.highlight,
    spotlight: spotlight.value,
  }),
)

const ariaLabel = computed(() =>
  (props.title || (slots.title && getSlotChildrenText(slots.title())) || 'Card link').trim(),
)
</script>

<template>
  <Primitive
    ref="cardRef"
    :as="as"
    :data-orientation="orientation"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
    :style="spotlight && { '--spotlight-x': `${elementX}px`, '--spotlight-y': `${elementY}px` }"
    @click="onClick"
  >
    <div v-if="props.spotlight" :class="ui.spotlight({ class: props.ui?.spotlight })" />

    <div :class="ui.container({ class: props.ui?.container })">
      <div
        v-if="
          !!slots.header ||
          !!slots.body ||
          icon ||
          !!slots.leading ||
          title ||
          !!slots.title ||
          description ||
          !!slots.description ||
          !!slots.footer
        "
        :class="ui.wrapper({ class: props.ui?.wrapper })"
      >
        <div v-if="!!slots.header" :class="ui.header({ class: props.ui?.header })">
          <slot name="header" />
        </div>

        <div v-if="icon || !!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
          <slot name="leading">
            <UIcon
              v-if="icon"
              :name="icon"
              :class="ui.leadingIcon({ class: props.ui?.leadingIcon })"
            />
          </slot>
        </div>

        <div
          v-if="!!slots.body || title || !!slots.title || description || !!slots.description"
          :class="ui.body({ class: props.ui?.body })"
        >
          <slot name="body">
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

        <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
          <slot name="footer" />
        </div>
      </div>

      <slot />
    </div>

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
  </Primitive>
</template>
