<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import type { LinkProps } from '@nuxt/ui'
import type { PartialString } from '@/components/content/types/utils'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/card'
import { tv } from '../../utils/tv'

const appConfigProseCard = _appConfig as AppConfig & {
  uiPro: { prose: { card: Partial<typeof theme> } }
}

const card = tv({ extend: tv(theme), ...(appConfigProseCard.uiPro?.prose?.card || {}) })

type CardVariants = VariantProps<typeof card>

interface CardProps {
  to?: LinkProps['to']
  target?: LinkProps['target']
  icon?: string
  title?: string
  color?: CardVariants['color']
  class?: any
  ui?: PartialString<typeof card.slots>
}

interface CardSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '@/components/composables/appConfig'

defineOptions({ inheritAttrs: false })

const props = defineProps<CardProps>()
const slots = defineSlots<CardSlots>()

const appConfig = useAppConfig()

const ui = computed(() =>
  card({
    color: props.color,
    to: !!props.to,
    title: !!props.title,
  }),
)

const target = computed(
  () =>
    props.target ||
    (!!props.to && typeof props.to === 'string' && props.to.startsWith('http')
      ? '_blank'
      : undefined),
)

const ariaLabel = computed(() => (props.title || 'Card link').trim())
</script>

<template>
  <div :class="ui.base({ class: props.class })">
    <ULink
      v-if="to"
      :aria-label="ariaLabel"
      v-bind="{ to, target, ...$attrs }"
      class="focus:outline-none"
      tabindex="-1"
      raw
    >
      <span class="absolute inset-0" aria-hidden="true" />
    </ULink>

    <UIcon v-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
    <UIcon
      v-if="!!to && target === '_blank'"
      :name="appConfig.ui.icons.external"
      :class="ui.externalIcon({ class: props.ui?.externalIcon })"
    />

    <p :class="ui.title({ class: props.ui?.title })">
      {{ title }}
    </p>

    <p v-if="!!slots.default" :class="ui.description({ class: props.ui?.description })">
      <slot mdc-unwrap="p" />
    </p>
  </div>
</template>
