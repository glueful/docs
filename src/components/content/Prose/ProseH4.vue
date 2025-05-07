<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/h4'
import { tv } from '../../utils/tv'

const appConfigProseH4 = _appConfig as AppConfig & {
  uiPro: { prose: { h4: Partial<typeof theme> } }
}

const proseH4 = tv({ extend: tv(theme), ...(appConfigProseH4.uiPro?.prose?.h4 || {}) })
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id?: string
  class?: any
  ui?: Partial<typeof proseH4.slots>
}>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = proseH4()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(
  () => props.id && typeof headings?.anchorLinks === 'object' && headings.anchorLinks.h4,
)
function useRuntimeConfig() {
  // In a real Nuxt app, this would use the built-in useRuntimeConfig
  // For now, we'll mock the expected structure
  return {
    public: {
      mdc: {
        headings: {
          anchorLinks: {
            h4: true,
          },
        },
      },
    },
  }
}
</script>

<template>
  <h4 :id="id" :class="ui.base({ class: props.class })">
    <a v-if="id && generate" :href="`#${id}`" :class="ui.link({ class: props.ui?.link })">
      <slot />
    </a>
    <slot v-else />
  </h4>
</template>
