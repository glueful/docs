<script setup lang="ts">
import { ref } from 'vue'

// Import the logo images
import logoLight from '../assets/logo_full.svg'
import logoDark from '../assets/logo_full_dark_theme.svg'
import { useRouter } from 'vue-router'

const router = useRouter()

const items = ref([
  [
    {
      label: 'Docs',
      icon: 'i-lucide-book-open',
      to: '/docs/getting-started',
    },
    {
      label: 'Catalog',
      icon: 'i-lucide-blocks',
      to: '/catalog',
    },
  ],
])
const handleLogoClick = () => {
  // Scroll to the top of the page
  router.push('/')
}
</script>

<template>
  <Header :ui="{ container: 'max-w-[95rem]', center: 'flex-1' }">
    <template #left>
      <div class="logo">
        <img
          :src="logoLight"
          alt="Glueful Logo"
          class="light-logo cursor-pointer"
          @click="handleLogoClick"
        />
        <img
          :src="logoDark"
          alt="Glueful Logo"
          class="dark-logo cursor-pointer"
          @click="handleLogoClick"
        />
      </div>
    </template>
    <ContentSearchButton :collapsed="false" class="w-full" />
    <template #right>
      <UNavigationMenu :items="items" class="hidden lg:block" color="neutral" />
      <UButton
        icon="i-tabler-brand-github-filled"
        size="md"
        color="primary"
        variant="ghost"
        to="https://github.com/glueful/glueful"
        target="_blank"
      />
    </template>
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" color="neutral" />
    </template>
  </Header>
</template>
