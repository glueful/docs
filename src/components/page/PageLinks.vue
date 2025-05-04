<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import type { LinkProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/page-links'
import { tv } from '../utils/tv'

const appConfigPageLinks = _appConfig as AppConfig & { uiPro: { pageLinks: Partial<typeof theme> } }

const pageLinks = tv({ extend: tv(theme), ...(appConfigPageLinks.uiPro?.pageLinks || {}) })

export interface PageLink extends Omit<LinkProps, 'custom'> {
  label: string
  icon?: string
}

export interface PageLinksProps<T> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'nav'
   */
  as?: any
  title?: string
  links?: T[]
  class?: any
  ui?: Partial<typeof pageLinks.slots>
}

type SlotProps<T> = (props: { link: T; active: boolean }) => any

export interface PageLinksSlots<T> {
  'title'(props?: {}): any
  link: SlotProps<T>
  'link-leading': SlotProps<T>
  'link-label': SlotProps<T>
  'link-trailing': SlotProps<T>
}
</script>

<script setup lang="ts" generic="T extends PageLink">
import { Primitive } from 'reka-ui'
import { pickLinkProps } from '@nuxt/ui/utils/link'
import { useAppConfig } from '@/components/composables/appConfig'

const props = withDefaults(defineProps<PageLinksProps<T>>(), {
  as: 'nav',
})
const slots = defineSlots<PageLinksSlots<T>>()

const appConfig = useAppConfig()

// eslint-disable-next-line vue/no-dupe-keys
const ui = pageLinks()
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <p v-if="title" :class="ui.title({ class: props.ui?.title })">
      <slot name="title">
        {{ title }}
      </slot>
    </p>

    <ul :class="ui.list({ class: props.ui?.list })">
      <li v-for="(link, index) in links" :key="index" :class="ui.item({ class: props.ui?.item })">
        <ULink v-slot="{ active, ...slotProps }" v-bind="pickLinkProps(link)" custom>
          <ULinkBase
            v-bind="slotProps"
            :class="ui.link({ class: [props.ui?.link, link.class], active })"
          >
            <slot name="link" :link="link" :active="active">
              <slot name="link-leading" :link="link" :active="active">
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
                <slot name="link-label" :link="link" :active="active">
                  {{ link.label }}
                </slot>

                <UIcon
                  v-if="link.target === '_blank'"
                  :name="appConfig.ui.icons.external"
                  :class="
                    ui.linkLabelExternalIcon({ class: props.ui?.linkLabelExternalIcon, active })
                  "
                />
              </span>

              <slot name="link-trailing" :link="link" :active="active" />
            </slot>
          </ULinkBase>
        </ULink>
      </li>
    </ul>
  </Primitive>
</template>
