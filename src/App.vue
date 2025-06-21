<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateNavigation, parseFrontmatter, formatTitle } from './utils/navigationGenerator'

const navigation: any = ref([])
const files: any = ref([])

onMounted(async () => {
  // 1. Generate navigation using existing method
  navigation.value = await generateNavigation()

  // 2. Get all content files using existing glob pattern
  const contentModules = import.meta.glob('/src/content/**/*.md', {
    as: 'raw',
    eager: true,
  })

  // 3. Process into search format
  Object.entries(contentModules).forEach(([path, content]: any) => {
    let routePath = path.replace('/src/content', '/docs').replace('.md', '')

    // Remove numeric prefixes from path segments to match navigation
    routePath = routePath.replace(/\/\d+\./g, '/').replace(/\/\d+$/, '')

    // Handle index files - remove /index suffix to match navigation
    if (routePath.endsWith('/index')) {
      routePath = routePath.replace('/index', '')
    }

    const { data: frontmatter, content: body } = parseFrontmatter(content)

    const fileItem = {
      id: routePath,
      title: frontmatter.title || formatTitle(path.split('/').pop().replace('.md', '')),
      content: body.replace(/[#*`\[\]]/g, '').trim(), // Basic markdown cleanup
      level: 1,
      titles: routePath.split('/').filter(Boolean).slice(1), // Remove 'docs'
    }

    files.value.push(fileItem)
  })
})
</script>

<template>
  <UApp>
    <RouterView />
    <ContentSearch
      :navigation="navigation"
      :files="files"
      placeholder="Search documentation..."
      :ui="{ modal: 'sm:max-w-3xl h-[90vh] sm:h-[60vh] max-h-[48rem] z-[9999]' }"
      aria-label="Search documentation"
      aria-describedby="search-description"
    />
  </UApp>
</template>
