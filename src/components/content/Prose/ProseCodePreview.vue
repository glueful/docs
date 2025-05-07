<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/code-preview'
import { tv } from '../../utils/tv'

const appConfigProseCodePreview = _appConfig as AppConfig & {
  uiPro: { prose: { codePreview: Partial<typeof theme> } }
}

const codePreview = tv({
  extend: tv(theme),
  ...(appConfigProseCodePreview.uiPro?.prose?.codePreview || {}),
})

interface CodePreviewProps {
  class?: any
  ui?: Partial<typeof codePreview.slots>
}

interface CodePreviewSlots {
  default(props?: {}): any
  code(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<CodePreviewProps>()
const slots = defineSlots<CodePreviewSlots>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() => codePreview({ code: !!slots.code }))
</script>

<template>
  <div :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div :class="ui.preview({ class: [props.ui?.preview] })">
      <slot />
    </div>

    <div v-if="!!slots.code" :class="ui.code({ class: [props.ui?.code] })">
      <slot name="code" />
    </div>
  </div>
</template>
