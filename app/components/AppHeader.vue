<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()

const menuItems = [
  { label: 'Docs', to: '/getting-started' },
  { label: 'Extensions', to: '/extensions' },
  { label: 'Tooling', to: '/tooling' }
]
</script>

<template>
  <UHeader
    :to="header?.to || '/'"
  >
    <template #left>
      <div class="flex items-center gap-2.5">
        <NuxtLink :to="header?.to || '/'">
          <AppLogo class="w-auto h-10 shrink-0" />
        </NuxtLink>

        <UButton
          v-if="header?.version"
          :to="`https://github.com/glueful/framework/releases/tag/v${header.version}`"
          target="_blank"
          :label="`v${header.version}`"
          color="neutral"
          variant="subtle"
          size="xs"
          class="font-mono rounded-full"
          :aria-label="`Glueful framework ${header.version} — view release notes on GitHub`"
        />
      </div>
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
