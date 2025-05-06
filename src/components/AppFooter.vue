<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  {
    label: 'Figma Kit',
    to: 'https://www.figma.com/community/file/1288455405058138934',
    target: '_blank',
  },
  {
    label: 'Playground',
    to: 'https://stackblitz.com/edit/nuxt-ui',
    target: '_blank',
  },
  {
    label: 'Roadmap',
    to: '/',
  },
  {
    label: 'Releases',
    to: 'https://github.com/nuxt/ui/releases',
    target: '_blank',
  },
]
</script>

<template>
  <Footer>
    <template #left>
      <p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }}</p>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UButton icon="i-tabler-brand-github-filled" size="md" color="primary" variant="ghost" />
    </template>
  </Footer>
</template>
