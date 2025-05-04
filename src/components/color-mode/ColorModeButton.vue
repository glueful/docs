<script lang="ts">
import type { ButtonProps } from '@nuxt/ui'

export interface ColorModeButtonProps
  extends /** @vue-ignore */ Pick<ButtonProps, 'as' | 'size' | 'disabled' | 'ui'> {
  /**
   * @defaultValue 'neutral'
   */
  color?: ButtonProps['color']
  /**
   * @defaultValue 'ghost'
   */
  variant?: ButtonProps['variant']
}
</script>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useAppConfig } from '@/components/composables/appConfig'

defineOptions({ inheritAttrs: false })

defineProps<ColorModeButtonProps>()
defineSlots<{
  fallback(props?: {}): any
}>()

const colorMode: any = useColorMode()
const appConfig: any = useAppConfig()
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>

<template>
  <div v-if="isMounted && !colorMode?.forced">
    <UButton
      :icon="isDark ? appConfig.ui.icons.dark : appConfig.ui.icons.light"
      color="neutral"
      variant="ghost"
      v-bind="$attrs"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
      @click="isDark = !isDark"
    />
  </div>
  <div v-else>
    <slot name="fallback">
      <div class="size-8" />
    </slot>
  </div>
</template>
