<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import type { PartialString } from '@/components/content/types/utils'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/collapsible'
import { tv } from '../../utils/tv'

const appConfigProseCollapsible = _appConfig as AppConfig & {
  uiPro: { prose: { collapsible: Partial<typeof theme> } }
}

const collapsible = tv({
  extend: tv(theme),
  ...(appConfigProseCollapsible.uiPro?.prose?.collapsible || {}),
})

interface CollapsibleProps {
  /**
   * The icon displayed to toggle the collapsible.
   * @defaultValue appConfig.ui.icons.chevronDown
   */
  icon?: string
  /**
   * The name displayed in the trigger label.
   * @defaultValue 'properties'
   */
  name?: string
  /**
   * The text displayed when the collapsible is open.
   * @defaultValue 'Show'
   */
  openText?: string
  /**
   * The text displayed when the collapsible is closed.
   * @defaultValue 'Hide'
   */
  closeText?: string
  class?: any
  ui?: PartialString<typeof collapsible.slots>
}
</script>

<script setup lang="ts">
import { useAppConfig } from '@/components/composables/appConfig'

const props = withDefaults(defineProps<CollapsibleProps>(), {
  name: 'properties',
  openText: 'Show',
  closeText: 'Hide',
})

const appConfig = useAppConfig()

// eslint-disable-next-line vue/no-dupe-keys
const ui = collapsible()
</script>

<template>
  <UCollapsible :unmount-on-hide="false" :class="ui.base({ class: props.class })">
    <template #default="{ open }">
      <button :class="ui.trigger({ class: props.ui?.trigger })">
        <UIcon
          :name="icon || appConfig.ui.icons.chevronDown"
          :class="ui.triggerIcon({ class: props.ui?.triggerIcon })"
        />

        <span :class="ui.triggerLabel({ class: props.ui?.triggerLabel })"
          >{{ open ? closeText : openText }} {{ name }}</span
        >
      </button>
    </template>

    <template #content>
      <slot mdc-unwrap="p" />
    </template>
  </UCollapsible>
</template>
