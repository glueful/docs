<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import type { PartialString } from '@/components/content/types/utils'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/prose/code-group'
import { tv } from '../../utils/tv'

const appConfigProseCodeGroup = _appConfig as AppConfig & {
  uiPro: { prose: { codeGroup: Partial<typeof theme> } }
}

const codeGroup = tv({
  extend: tv(theme),
  ...(appConfigProseCodeGroup.uiPro?.prose?.codeGroup || {}),
})

interface CodeGroupProps {
  /**
   * The default tab to select.
   * @example '1'
   */
  defaultValue?: string
  /**
   * Sync the selected tab with a local storage key.
   */
  sync?: string
  class?: any
  ui?: PartialString<typeof codeGroup.slots>
}

interface CodeGroupSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed, watch, onMounted, ref, onBeforeUpdate } from 'vue'
import { TabsRoot, TabsList, TabsIndicator, TabsTrigger, TabsContent } from 'reka-ui'
import CodeIcon from './CodeIcon.vue'

const props = withDefaults(defineProps<CodeGroupProps>(), {
  defaultValue: '0',
})
const slots = defineSlots<CodeGroupSlots>()

const model = defineModel<string>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = codeGroup()

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
    label: slot.props?.filename || slot.props?.label || `${index}`,
    icon: slot.props?.icon,
    component: slot,
  }
}

onMounted(() => {
  if (props.sync) {
    const syncKey = `code-group-${props.sync}`
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

onBeforeUpdate(() => rerenderCount.value++)
function useState<T>(key: string, initialValue: () => T) {
  const value = ref<T>(
    typeof localStorage !== 'undefined' && localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key) as string)
      : initialValue(),
  )
  return value
}
</script>

<template>
  <TabsRoot
    v-model="model"
    :default-value="defaultValue"
    :unmount-on-hide="false"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
  >
    <TabsList :class="ui.list({ class: props.ui?.list })">
      <TabsIndicator :class="ui.indicator({ class: props.ui?.indicator })" />

      <TabsTrigger
        v-for="(item, index) of items"
        :key="index"
        :value="String(index)"
        :class="ui.trigger({ class: props.ui?.trigger })"
      >
        <CodeIcon
          :icon="item.icon"
          :filename="item.label"
          :class="ui.triggerIcon({ class: props.ui?.triggerIcon })"
        />

        <span :class="ui.triggerLabel({ class: props.ui?.triggerLabel })">{{ item.label }}</span>
      </TabsTrigger>
    </TabsList>

    <TabsContent v-for="(item, index) of items" :key="index" :value="String(index)" as-child>
      <component :is="item.component" hide-header tabindex="-1" />
    </TabsContent>
  </TabsRoot>
</template>
