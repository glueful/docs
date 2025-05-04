<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-marquee'
import { tv } from '../utils/tv'

const appConfigPageMarquee = _appConfig as AppConfig & {
  uiPro: { pageMarquee: Partial<typeof theme> }
}

const pageMarquee = tv({ extend: tv(theme), ...(appConfigPageMarquee.uiPro?.pageMarquee || {}) })

type PageMarqueeVariants = VariantProps<typeof pageMarquee>

export interface PageMarqueeProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  pauseOnHover?: boolean
  reverse?: boolean
  orientation?: PageMarqueeVariants['orientation']
  repeat?: number
  overlay?: boolean
  class?: any
  ui?: Partial<typeof pageMarquee.slots>
}

export interface PageMarqueeSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<PageMarqueeProps>(), {
  orientation: 'horizontal',
  repeat: 4,
  overlay: true,
})

const ui = computed(() =>
  pageMarquee({
    pauseOnHover: props.pauseOnHover,
    orientation: props.orientation,
    reverse: props.reverse,
    overlay: props.overlay,
  }),
)
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div v-for="i in repeat" :key="i" :class="ui.content({ class: [props.ui?.content] })">
      <slot />
    </div>
  </Primitive>
</template>

<style>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}
@keyframes marquee-rtl {
  0% {
    transform: translateX(100%);
  }
  to {
    transform: translateX(calc(-100% * var(--repeat) - var(--gap) * var(--repeat)));
  }
}
@keyframes marquee-vertical {
  0% {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}
@keyframes marquee-vertical-rtl {
  0% {
    transform: translateY(100%);
  }
  to {
    transform: translateY(calc(-100% * var(--repeat) - var(--gap) * var(--repeat)));
  }
}
</style>
