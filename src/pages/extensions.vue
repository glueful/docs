<script setup lang="ts">
import { useAppConfig } from '@/components/composables/appConfig'
import { useAsync } from '@/composables/asyncData'
import useContentQuery from '@/composables/useContentQuery'
import { computed } from 'vue'

const toc: any = useAppConfig().toc
const { findByPath } = useContentQuery()

// Directly fetch the extensions/index.md file using the exact path
const { data } = useAsync(
  () => 'extensions-content', // Unique key for this content
  async () => {
    // Use exact path to the content file
    const result = await findByPath('/src/extensions/index.md')
    console.log('Extensions content:', result)
    if (!result) {
      throw new Error('Extensions content not found')
    }
    return result
  },
  {
    immediate: true,
    default: () => null,
  },
)

// We can derive the AST directly from content.data
const ast: any = computed(() => data.value?.ast || null)
</script>
<template>
  <AppHeader />
  <UContainer>
    <Page v-if="ast">
      <PageHeader
        v-if="ast?.data"
        :title="ast.data.title || 'Extensions'"
        :description="
          ast.data.description || 'Explore the powerful extensions available for our framework.'
        "
      />
      <PageHeader
        v-else
        title="Extensions"
        description="Explore the powerful extensions available for our framework."
      />
      <PageBody>
        <ContentRenderer v-if="ast" :value="ast" />
      </PageBody>
      <template v-if="ast?.toc?.links?.length" #right>
        <ContentToc
          :title="toc?.title"
          :links="ast.toc?.links"
          highlight
          highlight-color="neutral"
          color="neutral"
          v-if="ast"
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
  </UContainer>
  <AppFooter />
</template>
