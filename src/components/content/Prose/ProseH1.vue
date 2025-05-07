<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/h1'
import { tv } from '../../utils/tv'

const appConfigProseH1 = _appConfig as AppConfig & {
  uiPro: { prose: { h1: Partial<typeof theme> } }
}

const proseH1 = tv({ extend: tv(theme), ...(appConfigProseH1.uiPro?.prose?.h1 || {}) })
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id?: string
  class?: any
  ui?: Partial<typeof proseH1.slots>
}>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = proseH1()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(
  () => props.id && typeof headings?.anchorLinks === 'object' && headings.anchorLinks.h1,
)
// Import the runtime config composable from Nuxt
// This is a placeholder implementation since we're not in a Nuxt context
function useRuntimeConfig() {
  // In a real Nuxt app, this would use the built-in useRuntimeConfig
  // For now, we'll mock the expected structure
  return {
    public: {
      mdc: {
        headings: {
          anchorLinks: {
            h1: true,
          },
        },
      },
    },
  }
}
</script>

<template>
  <h1 :id="id" :class="ui.base({ class: props.class })">
    <a v-if="id && generate" :href="`#${id}`" :class="ui.link({ class: props.ui?.link })">
      <slot />
    </a>
    <slot v-else />
  </h1>
</template>
