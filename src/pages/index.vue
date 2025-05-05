<script setup lang="ts">
// Use Vite's raw import feature for markdown
import useMarkdownParser from '@/components/content/composables/useMarkdownParser'
import contentRaw from '@/content/index.md?raw'
import { onBeforeMount, ref } from 'vue'

// const content = ref({
//   body: {},
// })
// console.log('Content:', content.value)
// Use onMounted instead of top-level await

const ast = ref<any>(null)
const { parse } = useMarkdownParser()

onBeforeMount(async () => {
  ast.value = await parse(contentRaw)
  console.log('AST:', ast.value)
})
</script>

<template>
  <AppHeader />
  <Suspense>
    <template #default>
      <ContentRenderer :value="ast" />
    </template>
    <template #fallback>
      <div class="p-4 text-center">
        <p class="text-gray-500">Loading content...</p>
      </div>
    </template>
  </Suspense>
</template>
