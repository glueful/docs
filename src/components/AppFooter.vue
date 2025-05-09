<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
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
  <USeparator class="border-primary/30" />
  <Footer>
    <template #left>
      <p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }}</p>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UButton
        icon="i-tabler-brand-github-filled"
        size="md"
        color="primary"
        variant="ghost"
        to="https://github.com/glueful/glueful"
      />
    </template>
  </Footer>
</template>
