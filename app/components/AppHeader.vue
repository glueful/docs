<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()

const menuItems = [
  { label: 'Docs', to: '/getting-started' },
  { label: 'Catalog', to: '/extensions' }
]
</script>

<template>
  <UHeader
    :to="header?.to || '/'"
  >
    <template #left>
      <NuxtLink :to="header?.to || '/'">
        <AppLogo class="w-auto h-13 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="menuItems"
      variant="link"
      class="ml-1 hidden md:flex"
    />

    <template #right>
      <UContentSearchButton
        v-if="header?.search"
        :collapsed="true"
      />

      <template v-if="header?.links">
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #body>
      <UNavigationMenu
        :items="menuItems"
        orientation="vertical"
        class="-mx-2.5 mb-4"
      />

      <UContentNavigation
        highlight
        :navigation="navigation"
      />
    </template>
  </UHeader>
</template>
