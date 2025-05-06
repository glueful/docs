<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import type { AccordionRootProps, AccordionRootEmits } from 'reka-ui'
import type { AppConfig } from '@nuxt/schema'
import type { BadgeProps, LinkProps } from '@nuxt/ui'
import type { ContentNavigationItem } from './types/content'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/content-navigation'
import { tv } from '../utils/tv'

const appConfigContentNavigation = _appConfig as AppConfig & {
  uiPro: { contentNavigation: Partial<typeof theme> }
}

const contentNavigation = tv({
  extend: tv(theme),
  ...(appConfigContentNavigation.uiPro?.contentNavigation || {}),
})

type ContentNavigationVariants = VariantProps<typeof contentNavigation>

export interface ContentNavigationLink extends ContentNavigationItem {
  icon?: string
  /**
   * Display a badge on the link.
   * `{ color: 'neutral', variant: 'outline', size: 'sm' }`{lang="ts-type"}
   */
  badge?: string | number | BadgeProps
  target?: LinkProps['target']
  trailingIcon?: string
  disabled?: boolean
  children?: ContentNavigationLink[]
  defaultOpen?: boolean
  active?: boolean
  class?: any
}

export interface ContentNavigationProps<T> extends Pick<AccordionRootProps, 'disabled' | 'type'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'nav'
   */
  as?: any
  /**
   * When `true`, the tree will be opened based on the current route.
   * When `false`, the tree will be closed.
   * When `undefined` (default), the first item will be opened with `type="single"` and the first level will be opened with `type="multiple"`.
   */
  defaultOpen?: boolean
  /**
   * The icon displayed to toggle the accordion.
   * @defaultValue appConfig.ui.icons.chevronDown
   */
  trailingIcon?: string
  color?: ContentNavigationVariants['color']
  variant?: ContentNavigationVariants['variant']
  /**
   * Display a line next to the active link.
   * @defaultValue false
   */
  highlight?: boolean
  highlightColor?: ContentNavigationVariants['highlightColor']
  /**
   * When type is "single", allows closing content when clicking trigger for an open item.
   * When type is "multiple", this prop has no effect.
   * @defaultValue true
   */
  collapsible?: boolean
  level?: number
  navigation?: T[]
  class?: any
  ui?: Partial<typeof contentNavigation.slots>
}

export interface ContentNavigationEmits extends AccordionRootEmits {}

type SlotProps<T> = (props: { link: T; active?: boolean }) => any

export interface ContentNavigationSlots<T> {
  link: SlotProps<T>
  'link-leading': SlotProps<T>
  'link-title': SlotProps<T>
  'link-trailing': SlotProps<T>
}
</script>

<script setup lang="ts" generic="T extends ContentNavigationLink">
import { computed } from 'vue'
import {
  Primitive,
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  useForwardPropsEmits,
} from 'reka-ui'
import { pickLinkProps } from '@nuxt/ui/utils/link'
import { reactivePick, createReusableTemplate } from '@vueuse/core'
import { useAppConfig } from '@/components/composables/appConfig'
import { mapContentNavigationItem } from '../utils/content'
import { useRoute } from 'vue-router'

const props = withDefaults(defineProps<ContentNavigationProps<T>>(), {
  as: 'nav',
  defaultOpen: undefined,
  level: 0,
  type: 'multiple',
  collapsible: true,
  highlight: false,
})
const emits = defineEmits<ContentNavigationEmits>()
const slots = defineSlots<ContentNavigationSlots<T>>()

const rootProps = useForwardPropsEmits(
  reactivePick(props, 'collapsible', 'disabled', 'type'),
  emits,
)

const route = useRoute()
const appConfig: any = useAppConfig()
const [DefineLinkTemplate, ReuseLinkTemplate] = createReusableTemplate<{
  link: ContentNavigationLink
  active?: boolean
}>()

const ui = computed(() =>
  contentNavigation({
    color: props.color,
    variant: props.variant,
    highlight: props.highlight,
    highlightColor: props.highlightColor || props.color,
  }),
)

const defaultValue = computed(() => {
  // When `defaultOpen` is `false`, return `undefined` to close all items
  if (props.defaultOpen === false) {
    return undefined
  }
  // When `defaultOpen` is `undefined`, open the first item or the first level
  if (props.defaultOpen === undefined) {
    return props.type === 'single'
      ? '0'
      : (props.navigation
          ?.map((link, index) => link.defaultOpen !== false && String(index))
          .filter(Boolean) as string[])
  }
  // When `defaultOpen` is `true`, open items based on the current route
  const index = props.navigation?.findIndex((link: any) => route.path.startsWith(link.path))
  const tyindex = index === -1 ? 0 : index

  return props.type === 'multiple' ? [String(tyindex)] : String(tyindex)
})
</script>

<template>
  <DefineLinkTemplate v-slot="{ link, active }">
    <slot name="link" :link="link as T" :active="active">
      <slot name="link-leading" :link="link as T" :active="active">
        <UIcon
          v-if="link.icon"
          :name="link.icon"
          :class="ui.linkLeadingIcon({ class: props.ui?.linkLeadingIcon, active })"
        />
      </slot>

      <span
        v-if="link.title || !!slots['link-title']"
        :class="ui.linkTitle({ class: props.ui?.linkTitle, active })"
      >
        <slot name="link-title" :link="link as T" :active="active">
          {{ link.title }}
        </slot>

        <UIcon
          v-if="link.target === '_blank'"
          :name="appConfig.ui.icons.external"
          :class="ui.linkTitleExternalIcon({ class: props.ui?.linkTitleExternalIcon, active })"
        />
      </span>

      <span
        v-if="
          link.badge ||
          (link.children?.length && !disabled) ||
          link.trailingIcon ||
          !!slots['link-trailing']
        "
        :class="ui.linkTrailing({ class: props.ui?.linkTrailing })"
      >
        <slot name="link-trailing" :link="link as T" :active="active">
          <UBadge
            v-if="link.badge"
            color="neutral"
            variant="outline"
            :size="
              (props.ui?.linkTrailingBadgeSize || ui.linkTrailingBadgeSize()) as BadgeProps['size']
            "
            v-bind="
              typeof link.badge === 'string' || typeof link.badge === 'number'
                ? { label: link.badge }
                : link.badge
            "
            :class="ui.linkTrailingBadge({ class: props.ui?.linkTrailingBadge })"
          />
          <UIcon
            v-if="link.children?.length && !disabled"
            :name="link.trailingIcon || trailingIcon || appConfig.ui.icons.chevronDown"
            :class="ui.linkTrailingIcon({ class: props.ui?.linkTrailingIcon })"
          />
          <UIcon
            v-else-if="link.trailingIcon"
            :name="link.trailingIcon"
            :class="ui.linkTrailingIcon({ class: props.ui?.linkTrailingIcon })"
          />
        </slot>
      </span>
    </slot>
  </DefineLinkTemplate>

  <Primitive
    :as="as"
    :as-child="level > 0"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
  >
    <AccordionRoot
      as="ul"
      v-bind="rootProps"
      :default-value="defaultValue"
      :class="
        level > 0
          ? ui.listWithChildren({ class: props.ui?.listWithChildren })
          : ui.list({ class: props.ui?.list })
      "
    >
      <template v-for="(link, index) in navigation" :key="index">
        <AccordionItem
          v-if="link.children?.length"
          as="li"
          :class="ui.itemWithChildren({ class: props.ui?.itemWithChildren })"
          :value="String(index)"
        >
          <AccordionTrigger
            as="button"
            :class="[
              ui.link({
                class: [props.ui?.link, link.class],
                active: link.active,
                disabled: !!link.disabled,
              }),
              ui.trigger({ class: props.ui?.trigger }),
            ]"
          >
            <ReuseLinkTemplate :link="link" :active="link.active" />
          </AccordionTrigger>

          <AccordionContent :class="ui.content({ class: props.ui?.content })">
            <UContentNavigation
              v-bind="rootProps"
              :navigation="link.children"
              :default-open="defaultOpen"
              :level="level + 1"
              :trailing-icon="trailingIcon"
              :color="color"
              :variant="variant"
              :highlight="highlight"
              :highlight-color="highlightColor"
              :ui="props.ui"
            >
              <template v-for="(_, name) in slots" #[name]="slotData: any">
                <slot :name="name" v-bind="slotData" />
              </template>
            </UContentNavigation>
          </AccordionContent>
        </AccordionItem>

        <li v-else :class="ui.item({ class: props.ui?.item })">
          <ULink
            v-slot="{ active, ...slotProps }"
            v-bind="pickLinkProps(mapContentNavigationItem(link))"
            custom
          >
            <ULinkBase
              v-bind="slotProps"
              :class="
                ui.link({
                  class: [props.ui?.link, link.class],
                  active,
                  disabled: !!link.disabled,
                  level: true,
                })
              "
            >
              <ReuseLinkTemplate :link="link" :active="active" />
            </ULinkBase>
          </ULink>
        </li>
      </template>
    </AccordionRoot>
  </Primitive>
</template>
