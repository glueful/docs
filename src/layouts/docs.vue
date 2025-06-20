<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateNavigation } from '@/utils/navigationGenerator'

const navigation: any = ref([])
const isLoaded = ref(false)

onMounted(async () => {
  navigation.value = await generateNavigation()
  isLoaded.value = true
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
</style>

<template>
  <AppHeader />

  <UContainer class="!max-w-[95rem] relative">
    <Page>
      <template #left>
        <PageAside
          class="border-x border-gray-200 dark:border-gray-800 overflow-y-auto"
          style="padding-left: 0; scrollbar-width: none; -ms-overflow-style: none"
        >
          <ContentNavigation
            highlight
            :navigation="navigation"
            v-if="isLoaded"
            custom-highlight-color="purple-600"
            type="single"
            :show-main-border="false"
          />
        </PageAside>
      </template>
      <UContainer>
        <RouterView />
      </UContainer>
    </Page>
  </UContainer>
  <Separator />
  <AppFooter />
</template>
