<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAsync } from '@/composables/asyncData'
import useContentQuery from '@/composables/useContentQuery'
import { computed, onMounted } from 'vue'
import { useAppConfig } from '@/components/composables/appConfig'

const route = useRoute()
const { findOne } = useContentQuery()
const toc: any = useAppConfig().toc

// Create a computed property for the route path to ensure reactivity
const currentPath: any = computed(() => route.path.replace(/^\/docs/, ''))

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

onMounted(() => {
  // This will run when the component is mounted
  // You can perform any additional setup here if needed
  // console.log('Component mounted, current path:', currentPath.value)
  console.log('toc:', toc)
})
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
      <ContentToc
        :title="toc?.title"
        :links="ast.toc?.links"
        highlight
        highlight-color="neutral"
        color="neutral"
      >
        <template v-if="toc?.bottom" #bottom>
          <div class="hidden lg:block space-y-6" :class="{ '!mt-6': toc?.links?.length }">
            <USeparator v-if="toc?.bottom.links?.length" type="dashed" />

            <PageLinks :title="toc.bottom.title" :links="toc?.bottom.links" />
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
