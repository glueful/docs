<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import type { LinkProps } from '@nuxt/ui'
import type { PartialString } from '@/components/content/types/utils'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/callout'
import { tv } from '../../utils/tv'

const appConfigProseCallout = _appConfig as AppConfig & {
  uiPro: { prose: { callout: Partial<typeof theme> } }
}

const callout = tv({ extend: tv(theme), ...(appConfigProseCallout.uiPro?.prose?.callout || {}) })

type CalloutVariants = VariantProps<typeof callout>

interface CalloutProps {
  to?: LinkProps['to']
  target?: LinkProps['target']
  icon?: string
  color?: CalloutVariants['color']
  class?: any
  ui?: PartialString<typeof callout.slots>
}

interface CalloutSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '@/components/composables/appConfig'

defineOptions({ inheritAttrs: false })

const props = defineProps<CalloutProps>()
defineSlots<CalloutSlots>()

const appConfig = useAppConfig()

const ui = computed(() =>
  callout({
    color: props.color,
    to: !!props.to,
  }),
)

const target = computed(
  () =>
    props.target ||
    (!!props.to && typeof props.to === 'string' && props.to.startsWith('http')
      ? '_blank'
      : undefined),
)
</script>

<template>
  <div :class="ui.base({ class: props.class })">
    <ULink
      v-if="to"
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

    <slot mdc-unwrap="p" />
  </div>
</template>
