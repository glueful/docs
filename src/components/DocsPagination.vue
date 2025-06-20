<script setup lang="ts">
import { onMounted } from 'vue'
import { useDocsNavigation } from '@/composables/useDocsNavigation'

const { prevPage, nextPage, loadNavigation, isLoaded } = useDocsNavigation()

onMounted(async () => {
  if (!isLoaded.value) {
    await loadNavigation()
  }
})
</script>

<template>
  <div 
    v-if="prevPage || nextPage" 
    class="docs-pagination mt-16 pt-8 border-t border-gray-200 dark:border-gray-800"
  >
    <div class="flex items-center justify-between gap-4">
      <ULink 
        v-if="prevPage" 
        :to="prevPage.path" 
        class="group flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 flex-1"
      >
        <UIcon 
          name="i-lucide-arrow-left" 
          class="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" 
        />
        <div class="text-left min-w-0 overflow-hidden">
          <div class="text-base font-medium">Previous</div>
          <div class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
            {{ prevPage.title }}
          </div>
        </div>
      </ULink>
      
      <div v-else class="flex-1" />
      
      <ULink 
        v-if="nextPage" 
        :to="nextPage.path" 
        class="group flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-right min-w-0 flex-1 justify-end"
      >
        <div class="text-right min-w-0 overflow-hidden">
          <div class="text-base font-medium">Next</div>
          <div class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
            {{ nextPage.title }}
          </div>
        </div>
        <UIcon 
          name="i-lucide-arrow-right" 
          class="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" 
        />
      </ULink>
    </div>
  </div>
</template>