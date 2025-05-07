<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateNavigation } from '@/utils/navigationGenerator'

const navigation: any = ref([])

onMounted(async () => {
  navigation.value = await generateNavigation()
})
</script>
<template>
  <AppHeader />
  <UContainer>
    <Page>
      <template #left>
        <PageAside>
          <ContentNavigation highlight :navigation="navigation" />
        </PageAside>
      </template>

      <RouterView />
    </Page>
  </UContainer>
  <Separator />
  <AppFooter />
</template>
