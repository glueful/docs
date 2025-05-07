<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/table'
import { tv } from '../../utils/tv'

const appConfigProseTable = _appConfig as AppConfig & {
  uiPro: { prose: { table: Partial<typeof theme> } }
}

const proseTable = tv({ extend: tv(theme), ...(appConfigProseTable.uiPro?.prose?.table || {}) })
</script>

<script setup lang="ts">
const props = defineProps<{
  class?: string
  ui?: Partial<typeof proseTable.slots>
}>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = proseTable()
</script>

<template>
  <div :class="ui.root({ class: [props.class, props.ui?.root] })">
    <table :class="ui.base({ class: props.ui?.base })">
      <slot />
    </table>
  </div>
</template>
