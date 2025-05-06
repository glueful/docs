<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { computed } from 'vue'
import MDCRenderer from '@nuxtjs/mdc/runtime/components/MDCRenderer.vue'
import { mdcComponents as defaultMdcComponents } from '@/plugins/mdc-components'
import { useContentPreview } from './composables/preview'

// Explicitly define the component name to avoid conflicts
defineOptions({
  name: 'ContentMarkdownRenderer',
})

const props = defineProps({
  /**
   * Content to render
   */
  value: {
    type: Object,
    required: true,
  },
  /**
   * Render only the excerpt
   */
  excerpt: {
    type: Boolean,
    default: false,
  },
  /**
   * Root tag to use for rendering
   */
  tag: {
    type: String,
    default: 'div',
  },
  /**
   * Whether to unwrap the content
   */
  unwrap: {
    type: Boolean,
    default: false,
  },
  /**
   * The map of custom components to use for rendering.
   */
  components: {
    type: Object,
    default: () => ({}),
  },
  /**
   * Additional data to pass to the renderer
   */
  data: {
    type: Object,
    default: () => ({}),
  },
})

// @ts-expect-error import.meta is not fully typed
const debug = import.meta.dev || useContentPreview()?.isEnabled?.() || false

const body = computed(() => {
  let body = props.value.body || props.value
  if (props.excerpt && props.value.excerpt) {
    body = props.value.excerpt
  }

  return body
})

const data = computed(() => {
  const { body, excerpt, ...contentData }: any = props.value
  return {
    ...contentData,
    ...props.data,
  }
})

const mdcComponents = computed(() => {
  return {
    ...defaultMdcComponents,
    ...props.components,
    ...(data.value._components || {}),
  }
})
</script>

<template>
  <Suspense>
    <MDCRenderer
      :body="body"
      :data="data"
      :tag="tag"
      :unwrap="unwrap"
      :components="mdcComponents"
      :data-content-id="debug ? value._id : undefined"
    />
  </Suspense>
</template>
