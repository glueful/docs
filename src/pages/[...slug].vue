<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAsync } from '@/composables/asyncData'
import useContentQuery from '@/composables/useContentQuery'
import { computed } from 'vue'

const route = useRoute()
const { findOne } = useContentQuery()
const { toc } = useAppConfig()
// Create a computed property for the route path to ensure reactivity
const currentPath: any = computed(() => route.path)

// Use the computed route path as part of the key to ensure it changes on route navigation
const { data } = useAsync(
  () => `content-${currentPath.value}`, // Dynamic key that updates when route changes
  async () => {
    const result = await findOne(currentPath.value)
    if (!result) {
      throw new Error(`Content not found for path: ${currentPath.value}`)
    }
    // console.log('Fetched content:', result)
    return result
  },
  {
    immediate: true,
    // Explicitly watch the currentPath to re-fetch when route changes
    watch: currentPath,
    default: () => null,
  },
)

// We can derive the AST directly from content.data
const ast: any = computed(() => data.value?.ast || null)
</script>

<template>
  <Page v-if="ast">
    <PageHeader
      :title="ast.data.title"
      :description="ast.data.description"
      :links="ast.data.links"
      v-if="ast"
    />
    <PageBody>
      <ContentRenderer :value="ast" />
    </PageBody>
    <template v-if="ast?.toc?.links?.length" #right>
      <ContentToc :title="toc?.title" :links="ast.toc?.links">
        <template v-if="toc?.bottom" #bottom>
          <div class="hidden lg:block space-y-6" :class="{ '!mt-6': ast.toc?.links?.length }">
            <USeparator v-if="ast.toc?.links?.length" type="dashed" />

            <PageLinks :title="ast.toc?.bottom.title" :links="ast.toc?.links" />
          </div>
        </template>
      </ContentToc>
    </template>
  </Page>
</template>

<route lang="json">
{
  "meta": {
    "layout": "docs"
  }
}
</route>
