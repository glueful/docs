<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/pre'
import { tv } from '../../utils/tv'

const appConfigProsePre = _appConfig as AppConfig & {
  uiPro: { prose: { pre: Partial<typeof theme> } }
}

const prosePre = tv({ extend: tv(theme), ...(appConfigProsePre.uiPro?.prose?.pre || {}) })
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import CodeIcon from './CodeIcon.vue'
import { useAppConfig } from '@/components/composables/appConfig'

const props = defineProps<{
  icon?: string
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  hideHeader?: boolean
  meta?: string
  class?: any
  ui?: Partial<typeof prosePre.slots>
}>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = prosePre()

const clipboard = useClipboard()
const appConfig = useAppConfig()

const copied = ref(false)

function copy() {
  clipboard.copy(props.code || '')

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div :class="ui.root({ class: [props.ui?.root], filename: !!filename })">
    <div v-if="filename && !hideHeader" :class="ui.header({ class: props.ui?.header })">
      <CodeIcon :icon="icon" :filename="filename" :class="ui.icon({ class: props.ui?.icon })" />

      <span :class="ui.filename({ class: props.ui?.filename })">{{ filename }}</span>
    </div>

    <UButton
      :icon="copied ? appConfig.ui.icons.copyCheck : appConfig.ui.icons.copy"
      color="neutral"
      variant="outline"
      size="sm"
      aria-label="Copy code to clipboard"
      :class="ui.copy({ class: props.ui?.copy })"
      tabindex="-1"
      @click="copy"
    />

    <pre :class="ui.base({ class: [props.class, props.ui?.base] })" v-bind="$attrs"><slot /></pre>
  </div>
</template>

<style>
.shiki span.line {
  display: block;
}
.shiki span.line.highlight {
  margin: 0 -16px;
  padding: 0 16px;
}
</style>
