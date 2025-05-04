<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import type { ButtonProps, DrawerProps, ModalProps, SlideoverProps } from '@nuxt/ui'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/header'
import { tv } from '../utils/tv'

const appConfigHeader = _appConfig as AppConfig & { uiPro: { header: Partial<typeof theme> } }

const header = tv({ extend: tv(theme), ...(appConfigHeader.uiPro?.header || {}) })

type HeaderMode = 'modal' | 'slideover' | 'drawer'
type HeaderMenu<T> = T extends 'modal'
  ? ModalProps
  : T extends 'slideover'
    ? SlideoverProps
    : T extends 'drawer'
      ? DrawerProps
      : never

export interface HeaderProps<T> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'header'
   */
  as?: any
  title?: string
  to?: string
  /**
   * The mode of the header menu.
   * @defaultValue 'modal'
   */
  mode?: T
  /**
   * The props for the header menu component.
   */
  menu?: HeaderMenu<T>
  /**
   * Customize the toggle button to open the header menu displayed when the `content` slot is used.
   * `{ color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   */
  toggle?: boolean | Partial<ButtonProps>
  /**
   * The side to render the toggle button on.
   * @defaultValue 'right'
   */
  toggleSide?: 'left' | 'right'
  class?: any
  ui?: Partial<typeof header.slots>
}

export interface HeaderSlots {
  title(props?: {}): any
  left(props?: {}): any
  default(props?: {}): any
  right(props?: {}): any
  toggle(props?: {}): any
  top(props?: {}): any
  bottom(props?: {}): any
  body(props?: {}): any
  content(props?: {}): any
}
</script>

<script setup lang="ts" generic="T extends HeaderMode">
import { computed, watch, toRef } from 'vue'
import { Primitive } from 'reka-ui'
import { defu } from 'defu'
import { createReusableTemplate } from '@vueuse/core'
import USlideover from '@nuxt/ui/components/Slideover.vue'
import UModal from '@nuxt/ui/components/Modal.vue'
import UDrawer from '@nuxt/ui/components/Drawer.vue'
import { useAppConfig } from '@/components/composables/appConfig'
import { useRoute } from 'vue-router'
import { getSlotChildrenText } from '../utils'

const props = withDefaults(defineProps<HeaderProps<T>>(), {
  as: 'header',
  mode: 'modal' as never,
  toggle: true,
  toggleSide: 'right',
  to: '/',
  title: 'Nuxt UI Pro',
})
const slots = defineSlots<HeaderSlots>()

const open = defineModel<boolean>('open', { default: false })

const route = useRoute()
const appConfig: any = useAppConfig()
const [DefineLeftTemplate, ReuseLeftTemplate] = createReusableTemplate()
const [DefineRightTemplate, ReuseRightTemplate] = createReusableTemplate()
const [DefineToggleTemplate, ReuseToggleTemplate] = createReusableTemplate()

const ariaLabel = computed(() =>
  (props.title || (slots.title && getSlotChildrenText(slots.title())) || 'Nuxt UI Pro').trim(),
)

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

// eslint-disable-next-line vue/no-dupe-keys
const ui = header()

const Menu = computed(
  () =>
    ({
      slideover: USlideover,
      modal: UModal,
      drawer: UDrawer,
    })[props.mode as HeaderMode],
)

const menuProps = toRef(
  () =>
    defu(
      props.menu,
      props.mode === 'modal' ? { fullscreen: true, transition: false } : {},
    ) as HeaderMenu<T>,
)
</script>

<template>
  <DefineToggleTemplate>
    <slot name="toggle" :open="open">
      <UButton
        v-if="toggle"
        color="neutral"
        variant="ghost"
        :aria-label="`${open ? 'Close' : 'Open'} menu`"
        :icon="open ? appConfig.ui.icons.close : appConfig.ui.icons.menu"
        v-bind="typeof toggle === 'object' ? (toggle as Partial<ButtonProps>) : {}"
        :class="ui.toggle({ class: props.ui?.toggle, toggleSide })"
        @click="open = !open"
      />
    </slot>
  </DefineToggleTemplate>

  <DefineLeftTemplate>
    <div :class="ui.left({ class: props.ui?.left })">
      <ReuseToggleTemplate v-if="toggleSide === 'left'" />

      <slot name="left">
        <ULink :to="to" :aria-label="ariaLabel" :class="ui.title({ class: props.ui?.title })">
          <slot name="title">
            {{ title }}
          </slot>
        </ULink>
      </slot>
    </div>
  </DefineLeftTemplate>

  <DefineRightTemplate>
    <div :class="ui.right({ class: props.ui?.right })">
      <slot name="right" />

      <ReuseToggleTemplate v-if="toggleSide === 'right'" />
    </div>
  </DefineRightTemplate>

  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <slot name="top" />

    <UContainer :class="ui.container({ class: props.ui?.container })">
      <ReuseLeftTemplate />

      <div :class="ui.center({ class: props.ui?.center })">
        <slot />
      </div>

      <ReuseRightTemplate />
    </UContainer>

    <slot name="bottom" />
  </Primitive>

  <Menu
    v-model:open="open"
    v-bind="menuProps"
    :ui="{
      overlay: ui.overlay({ class: props.ui?.overlay }),
      content: ui.content({ class: props.ui?.content }),
    }"
  >
    <template #content>
      <slot name="content">
        <div v-if="mode !== 'drawer'" :class="ui.header({ class: props.ui?.header })">
          <ReuseLeftTemplate />

          <ReuseRightTemplate />
        </div>

        <div :class="ui.body({ class: props.ui?.body })">
          <slot name="body" />
        </div>
      </slot>
    </template>
  </Menu>
</template>
