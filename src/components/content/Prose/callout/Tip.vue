<script setup lang="ts">
import { useAppConfig } from '@/components/composables/appConfig'
import Callout from '../Callout.vue'

const appConfig = useAppConfig()
</script>

<template>
  <Callout color="success" :icon="appConfig.ui.icons.tip">
    <slot mdc-unwrap="p" />
  </Callout>
</template>
