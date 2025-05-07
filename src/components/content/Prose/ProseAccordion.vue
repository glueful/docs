<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/accordion'
import { tv } from '../../utils/tv'

const appConfigProseAccordion = _appConfig as AppConfig & {
  uiPro: { prose: { accordion: Partial<typeof theme> } }
}

const accordion = tv({
  extend: tv(theme),
  ...(appConfigProseAccordion.uiPro?.prose?.accordion || {}),
})

interface AccordionProps {
  type?: 'single' | 'multiple'
  class?: any
}

interface AccordionSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed, ref, onBeforeUpdate } from 'vue'
import { transformUI } from '../../utils'

const props = withDefaults(defineProps<AccordionProps>(), {
  type: 'multiple',
})
const slots = defineSlots<AccordionSlots>()

const rerenderCount = ref(1)

const items = computed<
  {
    index: number
    label: string
    icon: string
    component: any
  }[]
>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  rerenderCount.value
  return slots.default?.()?.flatMap(transformSlot).filter(Boolean) || []
})

function transformSlot(slot: any, index: number) {
  if (typeof slot.type === 'symbol') {
    return slot.children?.map(transformSlot)
  }

  return {
    index,
    label: slot.props?.label || `${index}`,
    icon: slot.props?.icon,
    component: slot,
  }
}

onBeforeUpdate(() => rerenderCount.value++)
</script>

<template>
  <UAccordion
    :type="type"
    :items="items"
    :unmount-on-hide="false"
    :class="props.class"
    :ui="transformUI(accordion())"
  >
    <template #content="{ item }">
      <component :is="item.component" />
    </template>
  </UAccordion>
</template>
