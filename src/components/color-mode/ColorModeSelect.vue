<script lang="ts">
import type { SelectMenuProps } from '@nuxt/ui'

export interface ColorModeSelectProps
  extends /** @vue-ignore */ Pick<
    SelectMenuProps<any>,
    | 'color'
    | 'variant'
    | 'size'
    | 'trailingIcon'
    | 'selectedIcon'
    | 'content'
    | 'arrow'
    | 'portal'
    | 'disabled'
    | 'ui'
  > {}
</script>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useAppConfig } from '@/components/composables/appConfig'

defineOptions({ inheritAttrs: false })

defineProps<ColorModeSelectProps>()

const colorMode: any = useColorMode()
const appConfig: any = useAppConfig()
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const items = computed(() => [
  { label: 'System', value: 'system', icon: appConfig.ui.icons.system },
  { label: 'Light', value: 'light', icon: appConfig.ui.icons.light },
  { label: 'Dark', value: 'dark', icon: appConfig.ui.icons.dark },
])

const preference = computed({
  get() {
    return items.value.find((option) => option.value === colorMode.preference) || items.value[0]
  },
  set(option) {
    colorMode.preference = option!.value
  },
})
</script>

<template>
  <div v-if="isMounted && !colorMode?.forced">
    <USelectMenu
      v-model="preference"
      :search-input="false"
      v-bind="$attrs"
      :icon="preference?.icon"
      :items="items"
    />
  </div>
  <div v-else>
    <USelectMenu
      :search-input="false"
      v-bind="$attrs"
      :model-value="items[0]"
      :icon="items[0]?.icon"
      :items="items"
      disabled
    />
  </div>
</template>
