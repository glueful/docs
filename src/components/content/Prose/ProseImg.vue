<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/img'
import { tv } from '../../utils/tv'

const appConfigProseImg = _appConfig as AppConfig & {
  uiPro: { prose: { img: Partial<typeof theme> } }
}

const proseImg = tv({ extend: tv(theme), ...(appConfigProseImg.uiPro?.prose?.img || {}) })
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { withTrailingSlash, withLeadingSlash, joinURL } from 'ufo'

const props = defineProps<{
  src: string
  alt: string
  width?: string | number
  height?: string | number
  class?: any
}>()

const refinedSrc = computed(() => {
  if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL))
    if (_base !== '/' && !props.src.startsWith(_base)) {
      return joinURL(_base, props.src)
    }
  }
  return props.src
})
const useRuntimeConfig = () => {
  // In a real Nuxt app, this would be auto-imported
  // For this component, we need to return an object with app.baseURL
  return {
    app: {
      baseURL: process.env.BASE_URL || '/',
    },
  }
}

// Define the ImageComponent
const ImageComponent = 'img'
</script>

<template>
  <component
    :is="ImageComponent"
    :src="refinedSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :class="proseImg({ class: props.class })"
  />
</template>
