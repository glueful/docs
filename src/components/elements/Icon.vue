<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <IconifyIcon :icon="name.replace(/^i-/, '')" />
</template>
