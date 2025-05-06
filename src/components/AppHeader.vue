<script setup lang="ts">
import { computed } from 'vue'
import { useScrollspy } from './composables/useScrollspy'

// Import the logo images
import logoLight from '../assets/logo_full.svg'

const { activeHeadings } = useScrollspy()
const items = computed(() => [
  {
    label: 'Documentation',
    to: '#docs',
    active: activeHeadings.value.includes('docs') && !activeHeadings.value.includes('extensions'),
  },
  {
    label: 'Extensions',
    to: '#extensions',
    active: activeHeadings.value.includes('extensions'),
  },
])
</script>

<template>
  <Header>
    <template #left>
      <div class="logo">
        <img :src="logoLight" alt="Glueful Logo" class="light-logo" />
      </div>
    </template>
    <template #right>
      <UNavigationMenu :items="items" variant="link" class="hidden lg:block" />
      <UButton icon="i-tabler-brand-github-filled" size="md" color="primary" variant="ghost" />
    </template>
  </Header>
</template>
