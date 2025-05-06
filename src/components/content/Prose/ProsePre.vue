<template>
  <ProseCode
    :code="code"
    :language="language"
    :filename="filename"
    :highlights="highlights"
    :meta="meta"
  >
    <pre :class="preClasses" :style="style"><slot /></pre>
  </ProseCode>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
  style: {
    type: [String, Object],
    default: null,
  },
})

const preClasses = computed(() => {
  const baseClasses = props.class || ''
  const terminalClasses =
    'group font-mono text-sm/6 border border-muted bg-muted rounded-md px-4 py-3 whitespace-pre-wrap break-words overflow-x-auto focus:outline-none'

  return props.filename === 'Terminal' ? [baseClasses, terminalClasses] : baseClasses
})
</script>

<style>
pre code .line {
  display: block;
  min-height: 1rem;
}
</style>
