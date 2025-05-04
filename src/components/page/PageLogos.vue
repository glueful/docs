<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-logos'
import { tv } from '../utils/tv'
import type { PageMarqueeProps } from '../../types'

const appConfigPageLogos = _appConfig as AppConfig & { uiPro: { pageLogos: Partial<typeof theme> } }

const pageLogos = tv({ extend: tv(theme), ...(appConfigPageLogos.uiPro?.pageLogos || {}) })

type PageLogosItem =
  | {
      src: string
      alt: string
    }
  | string

export interface PageLogosProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  title?: string
  items?: PageLogosItem[]
  marquee?: boolean | PageMarqueeProps
  class?: any
  ui?: Partial<typeof pageLogos.slots>
}

export interface PageLogosSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { createReusableTemplate } from '@vueuse/core'

const [DefineCreateItemTemplate, ReuseCreateItemTemplate] = createReusableTemplate()

const props = withDefaults(defineProps<PageLogosProps>(), {
  marquee: false,
})
const slots = defineSlots<PageLogosSlots>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = pageLogos()
</script>

<template>
  <DefineCreateItemTemplate>
    <slot v-if="!!slots.default" />
    <template v-else-if="items?.length">
      <template v-for="(item, index) in items" :key="index">
        <UAvatar
          v-if="typeof item === 'object'"
          :src="item.src"
          :alt="item.alt"
          :class="ui.logo({ class: props.ui?.logo })"
        />
        <UIcon v-else :name="item" :class="ui.logo({ class: props.ui?.logo })" />
      </template>
    </template>
  </DefineCreateItemTemplate>

  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <h2 v-if="title" :class="ui.title({ class: props.ui?.title })">
      {{ title }}
    </h2>

    <UPageMarquee
      v-if="marquee"
      v-bind="typeof marquee === 'object' ? marquee : {}"
      :class="ui.logos({ class: props.ui?.logos, marquee: true })"
    >
      <ReuseCreateItemTemplate :items="items" />
    </UPageMarquee>
    <div v-else :class="ui.logos({ class: props.ui?.logos })">
      <ReuseCreateItemTemplate :items="items" />
    </div>
  </Primitive>
</template>
