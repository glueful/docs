<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import type { LinkProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/footer-columns'
import { tv } from '../utils/tv'

const appConfigFooterColumns = _appConfig as AppConfig & {
  uiPro: { footerColumns: Partial<typeof theme> }
}

const footerColumns = tv({
  extend: tv(theme),
  ...(appConfigFooterColumns.uiPro?.footerColumns || {}),
})

export interface FooterColumnLink extends Omit<LinkProps, 'custom'> {
  label: string
  icon?: string
}

export interface FooterColumn<T> {
  label: string
  children?: T[]
}

export interface FooterColumnsProps<T> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  class?: any
  columns?: FooterColumn<T>[]
  ui?: Partial<typeof footerColumns.slots>
}

type SlotProps<T> = (props: { link: T; active: boolean }) => any

export interface FooterColumnsSlots<T> {
  'left'(props?: {}): any
  'default'(props?: {}): any
  'right'(props?: {}): any
  link: SlotProps<T>
  'link-leading': SlotProps<T>
  'link-label': SlotProps<T>
  'link-trailing': SlotProps<T>
}
</script>

<script setup lang="ts" generic="T extends FooterColumnLink">
import { Primitive } from 'reka-ui'
import { pickLinkProps } from '@nuxt/ui/utils/link'
import { useAppConfig } from '@/components/composables/appConfig'

const props = withDefaults(defineProps<FooterColumnsProps<T>>(), {
  as: 'nav',
})
const slots = defineSlots<FooterColumnsSlots<T>>()

const appConfig: any = useAppConfig()

// eslint-disable-next-line vue/no-dupe-keys
const ui = footerColumns()
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })" v-bind="$attrs">
    <div v-if="!!slots.left" :class="ui.left({ class: props.ui?.left })">
      <slot name="left" />
    </div>

    <div v-if="!!slots.default || columns?.length" :class="ui.center({ class: props.ui?.center })">
      <slot>
        <div v-for="(column, index) in columns" :key="index">
          <h3 :class="ui.label({ class: props.ui?.label })">
            {{ column.label }}
          </h3>

          <ul :class="ui.list({ class: props.ui?.list })">
            <li
              v-for="(link, linkIndex) in column.children"
              :key="linkIndex"
              :class="ui.item({ class: props.ui?.item })"
            >
              <ULink v-slot="{ active, ...slotProps }" v-bind="pickLinkProps(link)" custom>
                <ULinkBase
                  v-bind="slotProps"
                  :class="ui.link({ class: [props.ui?.link, link.class], active })"
                >
                  <slot name="link" :link="link as T" :active="active">
                    <slot name="link-leading" :link="link as T" :active="active">
                      <UIcon
                        v-if="link.icon"
                        :name="link.icon"
                        :class="ui.linkLeadingIcon({ class: props.ui?.linkLeadingIcon, active })"
                      />
                    </slot>

                    <span
                      v-if="link.label || !!slots['link-label']"
                      :class="ui.linkLabel({ class: props.ui?.linkLabel, active })"
                    >
                      <slot name="link-label" :link="link as T" :active="active">
                        {{ (link as T).label }}
                      </slot>

                      <UIcon
                        v-if="link.target === '_blank'"
                        :name="appConfig.ui.icons.external"
                        :class="
                          ui.linkLabelExternalIcon({
                            class: props.ui?.linkLabelExternalIcon,
                            active,
                          })
                        "
                      />
                    </span>

                    <slot name="link-trailing" :link="link as T" :active="active" />
                  </slot>
                </ULinkBase>
              </ULink>
            </li>
          </ul>
        </div>
      </slot>
    </div>

    <div v-if="!!slots.right" :class="ui.right({ class: props.ui?.right })">
      <slot name="right" />
    </div>
  </Primitive>
</template>
