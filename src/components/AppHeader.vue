<script setup lang="ts">
import { computed } from 'vue'
import { useScrollspy } from './composables/useScrollspy'

// Import the logo images
import logoLight from '../assets/logo_full.svg'
import { useRouter } from 'vue-router'

const { activeHeadings } = useScrollspy()
const router = useRouter()
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
const handleLogoClick = () => {
  // Scroll to the top of the page
  router.push('/')
}
</script>

<template>
  <Header>
    <template #left>
      <div class="logo">
        <img
          :src="logoLight"
          alt="Glueful Logo"
          class="light-logo cursor-pointer"
          @click="handleLogoClick"
        />
      </div>
    </template>
    <template #right>
      <UNavigationMenu :items="items" variant="link" class="hidden lg:block" />
      <UButton icon="i-tabler-brand-github-filled" size="md" color="primary" variant="ghost" />
    </template>
  </Header>
</template>
