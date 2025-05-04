<script lang="ts">
import type { AppConfig } from '@/types/appConfig'
import type { ButtonProps } from '@nuxt/ui'
import type { NuxtError } from '@/types/error'
import _appConfig from '#build/app.config'
import theme from '@/components/themes/error'
import { tv } from './utils/tv'

const appConfigError = _appConfig as AppConfig & { uiPro: { error: Partial<typeof theme> } }

// eslint-disable-next-line vue/no-dupe-keys
const error = tv({ extend: tv(theme), ...(appConfigError.uiPro?.error || {}) })

export interface ErrorProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  error?: Partial<NuxtError & { message: string }>
  /**
   * The URL to redirect to when the error is cleared.
   * @defaultValue '/'
   */
  redirect?: string
  /**
   * Display a button to clear the error in the links slot.
   * `{ size: 'lg', color: 'primary', variant: 'solid', label: 'Back to home' }`{lang="ts-type"}
   * @defaultValue true
   */
  clear?: boolean | Partial<ButtonProps>
  class?: any
  ui?: Partial<typeof error.slots>
}

export interface ErrorSlots {
  default(props?: {}): any
  statusCode(props?: {}): any
  statusMessage(props?: {}): any
  links(props?: {}): any
}
</script>

<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { clearError } from '@/components/utils/error'

const props = withDefaults(defineProps<ErrorProps>(), {
  as: 'main',
  redirect: '/',
  clear: true,
})
defineSlots<ErrorSlots>()

// eslint-disable-next-line vue/no-dupe-keys
const ui = error()

function handleError() {
  clearError({ redirect: props.redirect })
}
</script>

<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <p :class="ui.statusCode({ class: props.ui?.statusCode })">
      {{ props.error?.statusCode }}
    </p>
    <h1
      v-if="props.error?.statusMessage"
      :class="ui.statusMessage({ class: props.ui?.statusMessage })"
    >
      {{ props.error.statusMessage }}
    </h1>
    <p
      v-if="props.error?.message && props.error.message !== props.error.statusMessage"
      :class="ui.message({ class: props.ui?.message })"
    >
      {{ props.error?.message }}
    </p>
    <div :class="ui.links({ class: props.ui?.links })">
      <UButton
        v-if="clear"
        size="lg"
        color="primary"
        variant="solid"
        label="Back to home"
        v-bind="typeof clear === 'object' ? (clear as Partial<ButtonProps>) : {}"
        @click="handleError"
      />
    </div>
  </Primitive>
</template>
