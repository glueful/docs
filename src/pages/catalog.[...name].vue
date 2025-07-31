<script setup lang="ts">
import { useAsync } from '@/composables/asyncData'
import useMarkdownParser from '@/components/content/composables/useMarkdownParser'
import type { TabsItem } from '@nuxt/ui'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

// Use Nuxt's auto-imported useRoute
const route = useRoute()
const extensionName = computed(() => route.params.name as string)

// Fetch extension details from the catalog
const { data: extensionData, error } = useAsync(
  () => `extension-${extensionName.value}`,
  async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/glueful/catalog/main/catalog.json',
      )
      if (!response.ok) {
        throw new Error('Failed to fetch catalog data')
      }
      const data = await response.json()
      // Find extension by name (case-insensitive)
      const extension = data.extensions?.find(
        (ext: any) => ext.name.toLowerCase() === extensionName.value.toLowerCase(),
      )

      if (!extension) {
        throw new Error('Extension not found')
      }

      return extension
    } catch (error) {
      console.error('Error fetching extension:', error)
      throw error
    }
  },
  {
    immediate: true,
    default: () => null,
  },
)

// Get markdown parser
const { parse: parseMarkdown } = useMarkdownParser()

// Fetch and parse readme content
const { data: readmeContent } = useAsync(
  () => `readme-${extensionName.value}`,
  async () => {
    // Wait for extension data to load
    if (!extensionData.value?.readme) {
      return null
    }
    
    try {
      const response = await fetch(extensionData.value.readme)
      if (!response.ok) {
        throw new Error('Failed to fetch readme')
      }
      const markdownText = await response.text()
      
      // Parse the markdown content using the project's parser
      const parsedContent = await parseMarkdown(markdownText)
      return parsedContent
    } catch (error) {
      console.error('Error fetching readme:', error)
      return null
    }
  },
  {
    immediate: false,
    default: () => null,
    watch: [() => extensionData.value?.readme],
  },
)

// Fetch and parse changelog content
const { data: changelogContent } = useAsync(
  () => `changelog-${extensionName.value}`,
  async () => {
    // Wait for extension data to load
    if (!extensionData.value?.changelog) {
      return null
    }
    
    try {
      const response = await fetch(extensionData.value.changelog)
      if (!response.ok) {
        throw new Error('Failed to fetch changelog')
      }
      const markdownText = await response.text()
      
      // Parse the markdown content using the project's parser
      const parsedContent = await parseMarkdown(markdownText)
      return parsedContent
    } catch (error) {
      console.error('Error fetching changelog:', error)
      return null
    }
  },
  {
    immediate: false,
    default: () => null,
    watch: [() => extensionData.value?.changelog],
  },
)

// Tab management
const tabs = ref<TabsItem[]>([
  {
    label: 'Details',
    icon: 'i-heroicons-information-circle',
    slot: 'details-tab' as const,
  },
  {
    label: 'Changelog',
    icon: 'i-heroicons-document-text',
    slot: 'changelog-tab' as const,
  },
])

</script>

<template>
  <AppHeader />
  <UContainer>
    <Page>
      <!-- Error State -->
      <div v-if="error" class="text-center py-12">
        <UIcon
          name="i-heroicons-exclamation-triangle-solid"
          class="w-16 h-16 mx-auto text-red-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Extension not found
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          The extension "{{ extensionName }}" could not be found.
        </p>
        <UButton to="/catalog" variant="soft">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
          Back to Catalog
        </UButton>
      </div>

      <!-- Loading State -->
      <div v-else-if="!extensionData" class="text-center py-12">
        <UIcon
          name="i-heroicons-arrow-path-solid"
          class="w-16 h-16 mx-auto text-gray-400 mb-4 animate-spin"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Loading extension details...
        </h3>
      </div>

      <!-- Extension Details -->
      <div v-else>
        <!-- Header -->
        <div class="mb-8">
          <UButton to="/catalog" variant="ghost" size="sm" class="mb-4">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
            Back to Catalog
          </UButton>

          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <img
                v-if="extensionData.icon"
                :src="extensionData.icon"
                :alt="extensionData.displayName"
                class="w-16 h-16 rounded-xl object-cover"
              />
              <div
                v-else
                class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center"
              >
                <UIcon name="i-heroicons-cube-solid" class="w-8 h-8 text-gray-500" />
              </div>

              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                  {{ extensionData.displayName }}
                </h1>
                <div
                  class="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span>v{{ extensionData.version }}</span>
                  <span>•</span>
                  <span>{{ extensionData.publisher }}</span>
                  <span>•</span>
                  <span>{{ extensionData.downloads }} downloads</span>
                  <span>•</span>
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400 mr-1" />
                    {{ extensionData.rating }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex space-x-2">
              <UButton
                v-if="extensionData.repository"
                :to="extensionData.repository"
                external
                variant="outline"
              >
                <UIcon name="i-heroicons-code-bracket-solid" class="w-4 h-4 mr-2" />
                View Source
              </UButton>
              <UButton
                v-if="extensionData.downloadUrl"
                :to="extensionData.downloadUrl"
                external
                color="primary"
              >
                <UIcon name="i-heroicons-arrow-down-tray-solid" class="w-4 h-4 mr-2" />
                Download
              </UButton>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <UTabs :items="tabs" class="w-full" variant="link">
          <template #details-tab>
            <div class="py-6 space-y-6">
              <!-- Readme Content or Description -->
              <div v-if="readmeContent" class="prose prose-gray dark:prose-invert max-w-none">
                <ContentRenderer :value="readmeContent" />
              </div>
              
              <!-- Fallback to Description if no readme -->
              <div v-else>
                <h3 class="text-lg font-semibold mb-2">Description</h3>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ extensionData.description }}
                </p>
              </div>

              <!-- Tags -->
              <div>
                <h3 class="text-lg font-semibold mb-2">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  <UBadge v-for="tag in extensionData.tags" :key="tag" variant="soft" size="sm">
                    {{ tag }}
                  </UBadge>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-lg font-semibold mb-2">Information</h3>
                  <dl class="space-y-2">
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Publisher
                      </dt>
                      <dd class="text-sm text-gray-900 dark:text-gray-100">
                        {{ extensionData.publisher }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Version</dt>
                      <dd class="text-sm text-gray-900 dark:text-gray-100">
                        {{ extensionData.version }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Last Updated
                      </dt>
                      <dd class="text-sm text-gray-900 dark:text-gray-100">
                        {{ new Date(extensionData.lastUpdated).toLocaleDateString() }}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 class="text-lg font-semibold mb-2">Resources</h3>
                  <div class="space-y-2">
                    <a
                      v-if="extensionData.repository"
                      :href="extensionData.repository"
                      target="_blank"
                      class="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <UIcon name="i-heroicons-code-bracket-solid" class="w-4 h-4 mr-2" />
                      Source Code
                    </a>
                    <a
                      v-if="extensionData.downloadUrl"
                      :href="extensionData.downloadUrl"
                      target="_blank"
                      class="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <UIcon name="i-heroicons-arrow-down-tray-solid" class="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #changelog-tab>
            <div class="py-6">
              <!-- Changelog Content -->
              <div v-if="changelogContent" class="prose prose-gray dark:prose-invert max-w-none">
                <ContentRenderer :value="changelogContent" />
              </div>
              
              <!-- Fallback message if no changelog -->
              <div v-else-if="!extensionData.changelog" class="text-center py-8">
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-12 h-12 mx-auto text-gray-400 mb-4"
                />
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Changelog Available
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                  This extension doesn't have a changelog yet.
                </p>
              </div>
              
              <!-- Loading state -->
              <div v-else class="text-center py-8">
                <UIcon
                  name="i-heroicons-arrow-path-solid"
                  class="w-8 h-8 mx-auto text-gray-400 mb-4 animate-spin"
                />
                <p class="text-gray-600 dark:text-gray-400">
                  Loading changelog...
                </p>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </Page>
  </UContainer>
  <AppFooter />
</template>
