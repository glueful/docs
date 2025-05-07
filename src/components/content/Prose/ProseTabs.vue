<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/tabs'
import { tv } from '../../utils/tv'

const appConfigProseTabs = _appConfig as AppConfig & {
  uiPro: { prose: { tabs: Partial<typeof theme> } }
}

const tabs = tv({ extend: tv(theme), ...(appConfigProseTabs.uiPro?.prose?.tabs || {}) })

interface TabsProps {
  /**
   * The default tab to select.
   * @example '1'
   */
  defaultValue?: string
  /**
   * Sync the selected tab with a local storage key.
   */
  sync?: string
  /**
   * The hash to scroll to when the tab is selected.
   */
  hash?: string
  class?: any
}

interface TabsSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed, watch, onMounted, ref, onBeforeUpdate, type Ref } from 'vue'
import { transformUI } from '../../utils'

const props = withDefaults(defineProps<TabsProps>(), {
  defaultValue: '0',
})
const slots = defineSlots<TabsSlots>()

const model = defineModel<string>()

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

onMounted(() => {
  if (props.sync) {
    const syncKey = `tabs-${props.sync}`
    const syncValue = useState<string>(syncKey, () => localStorage.getItem(syncKey) as string)

    watch(
      syncValue,
      () => {
        if (!syncValue.value) return

        model.value = syncValue.value
      },
      { immediate: true },
    )

    watch(model, () => {
      if (!model.value) return

      syncValue.value = model.value
      localStorage.setItem(syncKey, model.value)
    })
  }
})

async function onUpdateModelValue() {
  if (props.hash) {
    const hash = props.hash.startsWith('#') ? props.hash : `#${props.hash}`
    setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView()
    }, 200)
  }
}

onBeforeUpdate(() => rerenderCount.value++)
function useState<T>(key: string, initialValue: () => T): Ref<T> {
  const state = ref<T>(initialValue()) as Ref<T>
  return state
}
</script>

<template>
  <UTabs
    v-model="model"
    color="primary"
    variant="link"
    :items="items"
    :class="props.class"
    :unmount-on-hide="false"
    :ui="transformUI(tabs())"
    @update:model-value="onUpdateModelValue"
  >
    <template #content="{ item }">
      <component :is="item.component" />
    </template>
  </UTabs>
</template>
