<!-- eslint-disable vue/block-tag-newline -->
<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import type { AccordionProps, AccordionSlots, AccordionItem } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-accordion'
import { tv } from '../utils/tv'

const appConfigPageAccordion = _appConfig as AppConfig & {
  uiPro: { pageAccordion: Partial<typeof theme> }
}

const pageAccordion = tv({
  extend: tv(theme),
  ...(appConfigPageAccordion.uiPro?.pageAccordion || {}),
})

export interface PageAccordionProps<T> extends /** @vue-ignore */ Omit<AccordionProps<T>, 'type'> {
  type?: AccordionProps<T>['type']
  ui?: Partial<typeof pageAccordion.slots>
}

export type PageAccordionSlots<T> = AccordionSlots<T & { slot?: string }>
</script>

<script setup lang="ts" generic="T extends AccordionItem">
import { transformUI } from '../utils'

withDefaults(defineProps<PageAccordionProps<T>>(), {
  type: 'multiple',
})
const slots = defineSlots<PageAccordionSlots<T>>()
</script>

<template>
  <UAccordion :type="type" :unmount-on-hide="false" :ui="transformUI(pageAccordion())">
    <template v-for="(_, name) in slots" #[name]="slotData: any">
      <slot :name="name" v-bind="slotData" />
    </template>
  </UAccordion>
</template>
