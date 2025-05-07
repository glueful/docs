<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateNavigation } from '@/utils/navigationGenerator'

const navigation: any = ref([])
const isLoaded = ref(false)

onMounted(async () => {
  navigation.value = await generateNavigation()
  console.log('Generated navigation:', navigation.value)
  isLoaded.value = true
})
</script>
<template>
  <AppHeader />
  <UContainer>
    <Page>
      <template #left>
        <PageAside>
          <ContentNavigation highlight :navigation="navigation" v-if="isLoaded" />
        </PageAside>
      </template>

      <RouterView />
    </Page>
  </UContainer>
  <Separator />
  <AppFooter />
</template>
