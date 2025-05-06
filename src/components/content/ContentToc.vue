<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { CollapsibleRootProps, CollapsibleRootEmits } from 'reka-ui'
import type { TocLink } from './types/content'
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/content-toc'
import { tv } from '../utils/tv'

const appConfigContentToc = _appConfig as AppConfig & {
  uiPro: { contentToc: Partial<typeof theme> }
}

const contentToc = tv({ extend: tv(theme), ...(appConfigContentToc.uiPro?.contentToc || {}) })

export type ContentTocLink = TocLink & {
  class?: any
}

type ContentTocVariants = VariantProps<typeof contentToc>

export interface ContentTocProps<T> extends Pick<CollapsibleRootProps, 'defaultOpen' | 'open'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'nav'
   */
  as?: any
  /**
   * The icon displayed to collapse the content.
   * @defaultValue appConfig.ui.icons.chevronDown
   */
  trailingIcon?: string
  /**
   * The title of the table of contents.
   * @defaultValue 'Table of Contents'
   */
  title?: string
  color?: ContentTocVariants['color']
  /**
   * Display a line next to the active link.
   * @defaultValue false
   */
  highlight?: boolean
  highlightColor?: ContentTocVariants['highlightColor']
  links?: T[]
  class?: any
  ui?: Partial<typeof contentToc.slots>
}

export type ContentTocEmits = CollapsibleRootEmits & {
  move: [id: string]
}

type SlotProps<T> = (props: { link: T }) => any

export interface ContentTocSlots<T> {
  leading(props: { open: boolean }): any
  default(props: { open: boolean }): any
  trailing(props: { open: boolean }): any
  content(props: { links: T[] }): any
  link: SlotProps<T>
  top(props: { links?: T[] }): any
  bottom(props: { links?: T[] }): any
}
</script>

<script setup lang="ts" generic="T extends ContentTocLink">
import { computed } from 'vue'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  useForwardPropsEmits,
} from 'reka-ui'
import { reactivePick, createReusableTemplate } from '@vueuse/core'
import { useAppConfig } from '@/components/composables/appConfig'
import { useScrollspy } from '../composables/useScrollspy'
import { useRouter } from 'vue-router'

const props = withDefaults(defineProps<ContentTocProps<T>>(), {
  as: 'nav',
  title: 'On this page',
})
const emits = defineEmits<ContentTocEmits>()
const slots = defineSlots<ContentTocSlots<T>>()

const rootProps = useForwardPropsEmits(reactivePick(props, 'as', 'open', 'defaultOpen'), emits)

const router = useRouter()
const appConfig = useAppConfig()
const { activeHeadings } = useScrollspy()
const [DefineListTemplate, ReuseListTemplate] = createReusableTemplate<{
  links: T[]
  level: number
}>({
  props: {
    links: Array,
    level: Number,
  },
})
const [DefineTriggerTemplate, ReuseTriggerTemplate] = createReusableTemplate<{ open: boolean }>()

const ui = computed(() =>
  contentToc({
    color: props.color,
    highlight: props.highlight,
    highlightColor: props.highlightColor || props.color,
  }),
)

function scrollToHeading(id: string) {
  const encodedId = encodeURIComponent(id)
  router.push(`#${encodedId}`)
  emits('move', id)
}

function flattenLinks(links: T[]): T[] {
  return links.flatMap((link) => [
    link,
    ...(link.children ? flattenLinks(link.children as T[]) : []),
  ])
}

const indicatorStyle = computed(() => {
  if (!activeHeadings.value?.length) {
    return
  }

  const flatLinks = flattenLinks(props.links || [])
  const activeIndex = flatLinks.findIndex((link) => activeHeadings.value.includes(link.id))
  const linkHeight = 28
  const gapSize = 0

  return {
    '--indicator-size': `${linkHeight * activeHeadings.value.length + gapSize * (activeHeadings.value.length - 1)}px`,
    '--indicator-position': activeIndex >= 0 ? `${activeIndex * (linkHeight + gapSize)}px` : '0px',
  }
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-template-shadow -->
  <DefineListTemplate v-slot="{ links, level }">
    <ul
      :class="
        level > 0
          ? ui.listWithChildren({ class: props.ui?.listWithChildren })
          : ui.list({ class: props.ui?.list })
      "
    >
      <li
        v-for="(link, index) in links"
        :key="index"
        :class="
          link.children && link.children.length > 0
            ? ui.itemWithChildren({ class: props.ui?.itemWithChildren })
            : ui.item({ class: props.ui?.item })
        "
      >
        <a
          :href="`#${link.id}`"
          :class="
            ui.link({
              class: [props.ui?.link, link.class],
              active: activeHeadings.includes(link.id),
            })
          "
          @click.prevent="scrollToHeading(link.id)"
        >
          <slot name="link" :link="link">
            {{ link.text }}
          </slot>
        </a>

        <ReuseListTemplate
          v-if="link.children?.length"
          :links="link.children as T[]"
          :level="level + 1"
        />
      </li>
    </ul>
  </DefineListTemplate>

  <DefineTriggerTemplate v-slot="{ open }">
    <slot name="leading" :open="open" />

    <span :class="ui.title({ class: props.ui?.title })">
      <slot :open="open">{{ title }}</slot>
    </span>

    <span :class="ui.trailing({ class: props.ui?.trailing })">
      <slot name="trailing" :open="open">
        <UIcon
          :name="trailingIcon || appConfig.ui.icons.chevronDown"
          :class="ui.trailingIcon({ class: props.ui?.trailingIcon })"
        />
      </slot>
    </span>
  </DefineTriggerTemplate>

  <CollapsibleRoot
    v-slot="{ open }"
    v-bind="rootProps"
    :default-open="defaultOpen"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
  >
    <div :class="ui.container({ class: props.ui?.container })">
      <div v-if="!!slots.top" :class="ui.top({ class: props.ui?.top })">
        <slot name="top" :links="links" />
      </div>

      <template v-if="links?.length">
        <CollapsibleTrigger :class="ui.trigger({ class: 'lg:hidden' })">
          <ReuseTriggerTemplate :open="open" />
        </CollapsibleTrigger>

        <CollapsibleContent :class="ui.content({ class: [props.ui?.content, 'lg:hidden'] })">
          <div
            v-if="highlight"
            :class="ui.indicator({ class: props.ui?.indicator })"
            :style="indicatorStyle"
          />

          <slot name="content" :links="links">
            <ReuseListTemplate :links="links" :level="0" />
          </slot>
        </CollapsibleContent>

        <p :class="ui.trigger({ class: 'hidden lg:flex' })">
          <ReuseTriggerTemplate :open="open" />
        </p>

        <div :class="ui.content({ class: [props.ui?.content, 'hidden lg:flex'] })">
          <div
            v-if="highlight"
            :class="ui.indicator({ class: props.ui?.indicator })"
            :style="indicatorStyle"
          />

          <slot name="content" :links="links">
            <ReuseListTemplate :links="links" :level="0" />
          </slot>
        </div>
      </template>

      <div v-if="!!slots.bottom" :class="ui.bottom({ class: props.ui?.bottom })">
        <slot name="bottom" :links="links" />
      </div>
    </div>
  </CollapsibleRoot>
</template>
