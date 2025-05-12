<!-- @ts-expect-error import.meta is not fully typed -->
<script setup lang="ts">
import theme from '@/components/themes/link'
import { computed, getCurrentInstance } from 'vue'
import { defu } from 'defu'
import { isEqual, diff } from 'ohash/utils'
import { useForwardProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'
import { hasProtocol } from 'ufo'
import { useRoute, RouterLink } from 'vue-router'
import { useAppConfig } from '@/components/composables/appConfig'
import { tv } from '../utils/tv'
defineOptions({ inheritAttrs: false })
const props = defineProps({
  as: { type: null, required: false, default: 'button' },
  type: { type: null, required: false, default: 'button' },
  disabled: { type: Boolean, required: false },
  active: { type: Boolean, required: false, default: void 0 },
  exact: { type: Boolean, required: false },
  exactQuery: { type: [Boolean, String], required: false },
  exactHash: { type: Boolean, required: false },
  inactiveClass: { type: String, required: false, default: '' },
  custom: { type: Boolean, required: false },
  raw: { type: Boolean, required: false },
  class: { type: null, required: false },
  to: { type: null, required: false },
  href: { type: null, required: false },
  external: { type: Boolean, required: false },
  target: { type: [String, Object, null], required: false },
  rel: { type: [String, Object, null], required: false },
  noRel: { type: Boolean, required: false },
  prefetchedClass: { type: String, required: false },
  prefetch: { type: Boolean, required: false },
  prefetchOn: { type: [String, Object], required: false },
  noPrefetch: { type: Boolean, required: false },
  activeClass: { type: String, required: false, default: '' },
  exactActiveClass: { type: String, required: false },
  ariaCurrentValue: {
    type: String as () => 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false',
    required: false,
    default: 'page',
  },
  viewTransition: { type: Boolean, required: false },
  replace: { type: Boolean, required: false },
})
defineSlots()
const hasRouter = computed(() => {
  const app = getCurrentInstance()?.appContext.app
  return !!app?.config?.globalProperties?.$router
})
const route = computed(() => {
  if (!hasRouter.value) return null
  try {
    return useRoute()
  } catch {
    return null
  }
})
const appConfig: any = useAppConfig()
const routerLinkProps = useForwardProps(
  reactiveOmit(
    props,
    'as',
    'type',
    'disabled',
    'active',
    'exact',
    'exactQuery',
    'exactHash',
    'activeClass',
    'inactiveClass',
    'to',
    'raw',
    'class',
  ),
)
const ui = computed(() =>
  tv({
    extend: tv(theme),
    ...defu(
      {
        variants: {
          active: {
            true: props.activeClass,
            false: props.inactiveClass,
          },
        },
      },
      appConfig.ui?.link || {},
    ),
  }),
)
function isPartiallyEqual(item1: any, item2: any) {
  const diffedKeys = diff(item1, item2).reduce((filtered, q) => {
    if (q.type === 'added') {
      filtered.add(q.key)
    }
    return filtered
  }, /* @__PURE__ */ new Set())
  const item1Filtered = Object.fromEntries(
    Object.entries(item1).filter(([key]) => !diffedKeys.has(key)),
  )
  const item2Filtered = Object.fromEntries(
    Object.entries(item2).filter(([key]) => !diffedKeys.has(key)),
  )
  return isEqual(item1Filtered, item2Filtered)
}
const isExternal = computed(() => {
  if (!props.to) return false
  return typeof props.to === 'string' && hasProtocol(props.to, { acceptRelative: true })
})
function isLinkActive({
  route: linkRoute,
  isActive,
  isExactActive,
}: {
  route: any
  isActive: boolean
  isExactActive: boolean
}) {
  if (props.active !== void 0) {
    return props.active
  }
  if (!props.to || !route.value) {
    return false
  }
  if (props.exactQuery === 'partial') {
    if (!isPartiallyEqual(linkRoute.query, route.value.query)) return false
  } else if (props.exactQuery === true) {
    if (!isEqual(linkRoute.query, route.value.query)) return false
  }
  if (props.exactHash && linkRoute.hash !== route.value.hash) {
    return false
  }
  if (props.exact && isExactActive) {
    return true
  }
  if (!props.exact && isActive) {
    return true
  }
  return false
}
function resolveLinkClass({
  route: route2,
  isActive,
  isExactActive,
}: { route?: any; isActive?: boolean; isExactActive?: boolean } = {}) {
  const active = isLinkActive({
    route: route2,
    isActive: isActive || false,
    isExactActive: isExactActive || false,
  })
  if (props.raw) {
    return [props.class, active ? props.activeClass : props.inactiveClass]
  }
  return ui.value({ class: props.class, active, disabled: props.disabled })
}
</script>

<template>
  <template v-if="hasRouter && !isExternal">
    <RouterLink
      v-slot="{ href, navigate, route: linkRoute, isActive, isExactActive }"
      v-bind="routerLinkProps"
      :to="to || '#'"
      custom
    >
      <template v-if="custom">
        <slot
          v-bind="{
            ...$attrs,
            ...(exact && isExactActive ? { 'aria-current': props.ariaCurrentValue } : {}),
            as,
            type,
            disabled,
            href: to ? href : void 0,
            navigate,
            active: isLinkActive({ route: linkRoute, isActive, isExactActive }),
          }"
        />
      </template>
      <ULinkBase
        v-else
        v-bind="{
          ...$attrs,
          ...(exact && isExactActive ? { 'aria-current': props.ariaCurrentValue } : {}),
          as,
          type,
          disabled,
          href: to ? href : void 0,
          navigate,
        }"
        :class="resolveLinkClass({ route: linkRoute, isActive, isExactActive })"
      >
        <slot :active="isLinkActive({ route: linkRoute, isActive, isExactActive })" />
      </ULinkBase>
    </RouterLink>
  </template>

  <template v-else>
    <template v-if="custom">
      <slot
        v-bind="{
          ...$attrs,
          as,
          type,
          disabled,
          href: to,
          target: isExternal ? '_blank' : void 0,
          active: false,
        }"
      />
    </template>
    <ULinkBase
      v-else
      v-bind="{
        ...$attrs,
        as,
        type,
        disabled,
        href: to,
        target: isExternal ? '_blank' : void 0,
      }"
      :is-external="isExternal"
      :class="resolveLinkClass()"
    >
      <slot :active="false" />
    </ULinkBase>
  </template>
</template>
