<script setup lang="ts">
import { useAppConfig } from '@/components/composables/appConfig'
import Callout from '../Callout.vue'

const appConfig = useAppConfig()
</script>

<template>
  <Callout color="info" :icon="appConfig.ui.icons.info">
    <slot mdc-unwrap="p" />
  </Callout>
</template>
