<script setup lang="ts">
import { useAsync } from '@/composables/asyncData'
import { computed, ref } from 'vue'

// Fetch catalog data from the GitHub repository
const { data: catalogData } = useAsync(
  () => 'catalog-data',
  async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/glueful/catalog/main/catalog.json',
      )
      if (!response.ok) {
        throw new Error('Failed to fetch catalog data')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching catalog:', error)
      // Fallback to local catalog.json if GitHub fetch fails
      try {
        const localResponse = await fetch('/catalog/catalog.json')
        if (localResponse.ok) {
          return await localResponse.json()
        }
      } catch (localError) {
        console.error('Local catalog also failed:', localError)
      }
      throw error
    }
  },
  {
    immediate: true,
    default: () => ({ extensions: [] }),
  },
)

// Computed properties for catalog display
const extensions = computed(() => catalogData.value?.extensions || [])
const totalExtensions = computed(() => extensions.value.length)

// Search and filter functionality
const searchQuery = ref('')
const selectedTag = ref('')

const availableTags = computed(() => {
  const tags = new Set<string>()
  extensions.value.forEach((ext: any) => {
    ext.tags?.forEach((tag: string) => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const filteredExtensions = computed(() => {
  let filtered = extensions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (ext: any) =>
        ext.name.toLowerCase().includes(query) ||
        ext.displayName.toLowerCase().includes(query) ||
        ext.description.toLowerCase().includes(query) ||
        ext.tags?.some((tag: string) => tag.toLowerCase().includes(query)),
    )
  }

  if (selectedTag.value && selectedTag.value !== 'All Tags') {
    filtered = filtered.filter((ext: any) => ext.tags?.includes(selectedTag.value))
  }

  return filtered
})

// Clear filters method
const clearFilters = () => {
  searchQuery.value = ''
  selectedTag.value = 'All Tags'
}
</script>

<template>
  <AppHeader />
  <UContainer>
    <Page>
      <PageHeader
        title="Extension Catalog"
        description="Discover and install powerful extensions to enhance your Glueful framework experience."
      />

      <PageBody>
        <!-- Search and Filter Section -->
        <div class="mb-8 space-y-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <UInput
              v-model="searchQuery"
              placeholder="Search extensions..."
              icon="i-heroicons-magnifying-glass-20-solid"
              class="flex-1"
            />
            <USelect
              v-model="selectedTag"
              :items="['All Tags', ...availableTags] as string[]"
              placeholder="Filter by tag"
              class="w-full sm:w-48"
            />
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ filteredExtensions.length }} of {{ totalExtensions }} extensions
          </div>
        </div>

        <!-- Extensions Grid -->
        <div
          v-if="filteredExtensions.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <UCard
            v-for="extension in filteredExtensions"
            :key="extension.name"
            class="hover:shadow-lg transition-shadow"
            :ui="{
              root: 'h-full flex flex-col',
              body: 'flex-grow',
              footer: 'mt-auto',
            }"
          >
            <template #header>
              <div class="flex items-start justify-between">
                <ULink
                  :to="`/catalog/${extension.name.toLowerCase()}`"
                  class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    v-if="extension.icon"
                    :src="extension.icon"
                    :alt="extension.displayName"
                    class="w-10 h-10 rounded-lg object-cover"
                  />
                  <div
                    class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                    v-else
                  >
                    <UIcon name="i-heroicons-cube-solid" class="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ extension.displayName }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">v{{ extension.version }}</p>
                  </div>
                </ULink>
                <div class="flex items-center space-x-1">
                  <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm">{{ extension.rating }}</span>
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ extension.description }}</p>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in extension.tags"
                  :key="tag"
                  variant="soft"
                  size="sm"
                  class="cursor-pointer"
                  @click="selectedTag = tag"
                >
                  {{ tag }}
                </UBadge>
              </div>

              <div
                class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
              >
                <span>{{ extension.downloads }} downloads</span>
                <span>Updated {{ new Date(extension.lastUpdated).toLocaleDateString() }}</span>
              </div>
            </div>

            <template #footer>
              <div class="flex space-x-2 justify-between">
                <UButton :to="`/catalog/${extension.name.toLowerCase()}`" variant="soft" size="sm">
                  View Details
                </UButton>
                <div class="flex space-x-2">
                  <UButton
                    :to="`/catalog/${extension.name.toLowerCase()}`"
                    external
                    variant="ghost"
                    size="sm"
                  >
                    <UIcon name="i-heroicons-book-open-solid" class="w-4 h-4" />
                  </UButton>
                  <UButton :to="extension.repository" external variant="ghost" size="sm">
                    <UIcon name="i-heroicons-code-bracket-solid" class="w-4 h-4" />
                  </UButton>
                </div>
              </div>
            </template>
          </UCard>
        </div>

        <!-- Empty State -->
        <div v-else-if="catalogData && totalExtensions === 0" class="text-center py-12">
          <UIcon
            name="i-heroicons-cube-transparent-solid"
            class="w-16 h-16 mx-auto text-gray-400 mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No extensions available
          </h3>
          <p class="text-gray-600 dark:text-gray-400">Check back later for new extensions.</p>
        </div>

        <!-- No Results State -->
        <div
          v-else-if="totalExtensions > 0 && filteredExtensions.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-heroicons-magnifying-glass-solid"
            class="w-16 h-16 mx-auto text-gray-400 mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No extensions found
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
          <UButton @click="clearFilters" variant="ghost" class="mt-4"> Clear filters </UButton>
        </div>

        <!-- Loading State -->
        <div v-else class="text-center py-12">
          <UIcon
            name="i-heroicons-arrow-path-solid"
            class="w-16 h-16 mx-auto text-gray-400 mb-4 animate-spin"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Loading catalog...
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Fetching the latest extensions from the catalog.
          </p>
        </div>
      </PageBody>
    </Page>
  </UContainer>
  <AppFooter />
</template>
