<script setup lang="ts">
// Use Vite's raw import feature for markdown
import useMarkdownParser from '@/components/content/composables/useMarkdownParser'
import contentRaw from '@/content/index.md?raw'
import { onBeforeMount, ref } from 'vue'

const appear = ref(false)
const appeared = ref(false)
const isLoading = ref(false)
const ast = ref<any>(null)
const { parse } = useMarkdownParser()

onBeforeMount(async () => {
  isLoading.value = true

  ast.value = await parse(contentRaw)
  // console.log('AST:', ast.value)
  isLoading.value = false
  appear.value = true
  setTimeout(() => {
    appeared.value = true
  }, 400)
})
</script>

<template>
  <AppHeader />
  <Suspense>
    <template #default>
      <Main class="relative">
        <HeroBackground
          class="absolute w-full -top-px transition-all shrink-0"
          :class="[
            isLoading ? 'animate-pulse' : appear ? '' : 'opacity-0',
            appeared ? 'duration-[400ms]' : 'duration-1000',
          ]"
        />
        <ContentRenderer :value="ast" />
      </Main>
    </template>
    <template #fallback>
      <div class="p-4 text-center">
        <p class="text-gray-500">Loading content...</p>
      </div>
    </template>
  </Suspense>
  <AppFooter />
</template>
