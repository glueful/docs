<script setup lang="ts">
import { computed, useSlots, watch } from 'vue'
import ContentMarkdownRenderer from './ContentMarkdownRenderer.vue'

// Explicitly define the component name
defineOptions({
  name: 'ContentRenderer',
})

const props = defineProps({
  /**
   * The document to render.
   */
  value: {
    type: Object,
    required: false,
    default: () => ({})
  },
  /**
   * Whether or not to render the excerpt.
   * @default false
   */
  excerpt: {
    type: Boolean,
    default: false
  },
  /**
   * The tag to use for the renderer element.
   * @default 'div'
   */
  tag: {
    type: String,
    default: 'div'
  },
  /**
   * Whether to unwrap the content
   */
  unwrap: {
    type: Boolean,
    default: false
  },
  /**
   * The map of custom components to use for rendering.
   */
  components: {
    type: Object,
    default: () => ({})
  },
  /**
   * Additional data to pass to the renderer
   */
  data: {
    type: Object,
    default: () => ({})
  }
})

const slots = useSlots()

// Show warning when excerpt is requested but not available
watch(
  () => props.excerpt,
  (newExcerpt) => {
    if (newExcerpt && !props.value?.excerpt) {
      console.warn(`No excerpt found for document content/${props?.value?._path}.${props?.value?._extension}!`)
      console.warn("Make sure to use <!--more--> in your content if you want to use excerpt feature.")
    }
  },
  {
    immediate: true
  }
)

// Determine if content has markdown to render
const hasMarkdown = computed(() => {
  const content = props.excerpt ? props.value?.excerpt : props.value?.body
  // Check if content is a string or has children array
  return typeof content === 'string' ? content.length > 0 : content?.children?.length > 0
})

// Safely expose all props to slot content
const slotProps = computed(() => ({
  value: props.value,
  excerpt: props.excerpt,
  tag: props.tag,
  unwrap: props.unwrap,
  components: props.components,
  data: props.data
}))
</script>

<template>
  <!-- Use empty slot if there's no content and the empty slot is provided -->
  <slot
    v-if="!hasMarkdown && slots.empty"
    name="empty"
    v-bind="slotProps"
  />

  <!-- Use default slot if provided -->
  <slot
    v-else-if="slots.default"
    v-bind="slotProps"
  />

  <!-- Use ContentMarkdownRenderer for actual rendering -->
  <ContentMarkdownRenderer
    v-else-if="hasMarkdown"
    :value="value"
    :excerpt="excerpt"
    :tag="tag"
    :unwrap="unwrap"
    :components="components"
    :data="data"
  />

  <!-- Fallback when no content and no empty slot -->
  <pre v-else class="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
    {{ JSON.stringify({
      message: "No content available or use slots with <ContentRenderer>",
      ...slotProps
    }, null, 2) }}
  </pre>
</template>
