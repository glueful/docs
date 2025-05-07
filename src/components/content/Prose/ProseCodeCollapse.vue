<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import type { PartialString } from '@/components/content/types/utils'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/code-collapse'
import { tv } from '../../utils/tv'

const appConfigProseCodeCollapse = _appConfig as AppConfig & {
  uiPro: { prose: { codeCollapse: Partial<typeof theme> } }
}

const codeCollapse = tv({
  extend: tv(theme),
  ...(appConfigProseCodeCollapse.uiPro?.prose?.codeCollapse || {}),
})

interface CodeCollapseProps {
  /**
   * The icon displayed to toggle the code.
   * @defaultValue appConfig.ui.icons.chevronDown
   */
  icon?: string
  /**
   * The name displayed in the trigger label.
   * @defaultValue 'code'
   */
  name?: string
  /**
   * The text displayed when the code is collapsed.
   * @defaultValue 'Expand'
   */
  openText?: string
  /**
   * The text displayed when the code is expanded.
   * @defaultValue 'Collapse'
   */
  closeText?: string
  class?: any
  ui?: PartialString<typeof codeCollapse.slots>
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '@/components/composables/appConfig'

const props = withDefaults(defineProps<CodeCollapseProps>(), {
  name: 'code',
  openText: 'Expand',
  closeText: 'Collapse',
})

const open = defineModel<boolean>('open', { default: false })

const appConfig = useAppConfig()

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() => codeCollapse({ open: open.value }))
</script>

<template>
  <div :class="ui.root({ class: [props.class, props.ui?.root] })">
    <slot />

    <div :class="ui.footer({ class: props.ui?.footer })">
      <UButton
        :icon="icon || appConfig.ui.icons.chevronDown"
        color="neutral"
        variant="outline"
        :data-state="open ? 'open' : 'closed'"
        :label="`${open ? closeText : openText} ${name}`"
        :class="ui.trigger({ class: props.ui?.trigger })"
        :ui="{ leadingIcon: ui.triggerIcon({ class: props.ui?.triggerIcon }) }"
        @click="open = !open"
      />
    </div>
  </div>
</template>
