<script setup lang="ts">
import { useAppConfig } from '@/components/composables/appConfig'
import Callout from '../Callout.vue'

const appConfig = useAppConfig()
</script>

<template>
  <Callout color="error" :icon="appConfig.ui.icons.caution">
    <slot mdc-unwrap="p" />
  </Callout>
</template>
