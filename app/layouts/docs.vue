<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside
          class="border-x border-gray-200 dark:border-gray-800 overflow-y-auto"
          style="padding-left: 0; scrollbar-width: none; -ms-overflow-style: none"
        >
          <UContentNavigation
            highlight
            :navigation="navigation"
            trailing-icon="i-tabler-chevron-down"
            :ui="{ listWithChildren: 'ms-0', list: '-mx-0' }"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
