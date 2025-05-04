<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import type { ButtonProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-header'
import { tv } from '../utils/tv'

const appConfigPageHeader = _appConfig as AppConfig & {
  uiPro: { pageHeader: Partial<typeof theme> }
}

const pageHeader = tv({ extend: tv(theme), ...(appConfigPageHeader.uiPro?.pageHeader || {}) })

export interface PageHeaderProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  headline?: string
  title?: string
  description?: string
  /**
   * Display a list of Button next to the title.
   * `{ color: 'neutral', variant: 'outline' }`{lang="ts-type"}
   */
  links?: ButtonProps[]
  class?: any
  ui?: Partial<typeof pageHeader.slots>
}

export interface PageHeaderSlots {
  headline(props?: {}): any
  title(props?: {}): any
  description(props?: {}): any
  links(props?: {}): any
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'

const props = defineProps<PageHeaderProps>()
const slots = defineSlots<PageHeaderSlots>()

const ui = computed(() =>
  pageHeader({
    title: !!props.title || !!slots.title,
  }),
)
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div v-if="headline || !!slots.headline" :class="ui.headline({ class: props.ui?.headline })">
      <slot name="headline">
        {{ headline }}
      </slot>
    </div>

    <div :class="ui.container({ class: props.ui?.container })">
      <div :class="ui.wrapper({ class: props.ui?.wrapper })">
        <h1 v-if="title || !!slots.title" :class="ui.title({ class: props.ui?.title })">
          <slot name="title">
            {{ title }}
          </slot>
        </h1>

        <div v-if="links?.length || !!slots.links" :class="ui.links({ class: props.ui?.links })">
          <slot name="links">
            <UButton
              v-for="(link, index) in links"
              :key="index"
              color="neutral"
              variant="outline"
              v-bind="link"
            />
          </slot>
        </div>
      </div>

      <div
        v-if="description || !!slots.description"
        :class="ui.description({ class: props.ui?.description })"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </div>

      <slot />
    </div>
  </Primitive>
</template>
