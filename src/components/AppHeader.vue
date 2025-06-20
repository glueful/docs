<script setup lang="ts">
import { ref } from 'vue'

// Import the logo images
import logoLight from '../assets/logo_full.svg'
import logoDark from '../assets/logo_full_dark_theme.svg'
import { useRouter } from 'vue-router'
import { useContentSearch } from './composables/index'

const router = useRouter()
const { open } = useContentSearch()

const handleSearchClick = () => {
  open.value = true
}
const items = ref([
  [
    {
      label: 'Docs',
      icon: 'i-lucide-book-open',
      to: '/docs/getting-started',
    },
    {
      label: 'Extensions',
      icon: 'i-lucide-blocks',
      to: '/extensions',
    },
    // {
    //   label: '',
    //   icon: 'i-tabler-brand-github-filled',
    //   target: '_blank',
    //   to: 'https://github.com/glueful',
    // },
  ],
])
const handleLogoClick = () => {
  // Scroll to the top of the page
  router.push('/')
}
</script>

<template>
  <Header :ui="{ container: 'max-w-[95rem]' }">
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
    <template #right>
      <UNavigationMenu :items="items" class="hidden lg:block" color="neutral" />
      <UButton
        icon="i-lucide-search"
        size="md"
        color="primary"
        variant="ghost"
        @click="handleSearchClick"
        class="mr-2"
      >
        <span class="hidden md:inline">Search</span>
        <kbd class="hidden md:inline-flex ml-2 text-xs">⌘K</kbd>
      </UButton>
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
