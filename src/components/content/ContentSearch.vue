<!-- eslint-disable vue/block-lang -->
<script setup>
import { computed, useTemplateRef } from 'vue'
import { useForwardProps } from 'reka-ui'
import { defu } from 'defu'
import { reactivePick } from '@vueuse/core'
import { omit } from '@nuxt/ui/utils'
import {
  useAppConfig,
  useColorMode,
  defineShortcuts,
  useLocalePro,
  useContentSearch,
} from '../composables'
import { transformUI } from '../utils/'
import { tv } from '../utils/tv'
import theme from '../themes/content-search'
const props = defineProps({
  icon: { type: String, required: false },
  placeholder: { type: null, required: false },
  autofocus: { type: Boolean, required: false },
  loading: { type: Boolean, required: false },
  loadingIcon: { type: String, required: false },
  close: { type: [Boolean, Object], required: false, default: true },
  closeIcon: { type: String, required: false },
  shortcut: { type: String, required: false, default: 'meta_k' },
  links: { type: Array, required: false },
  navigation: { type: Array, required: false },
  groups: { type: Array, required: false },
  files: { type: Array, required: false },
  fuse: { type: Object, required: false },
  colorMode: { type: Boolean, required: false, default: true },
  class: { type: null, required: false },
  ui: { type: void 0, required: false },
})
const slots = defineSlots()
const searchTerm = defineModel('searchTerm', { type: String, ...{ default: '' } })
const { t } = useLocalePro()
const { open } = useContentSearch()

const _colorMode = useColorMode()
const appConfig = useAppConfig()
const commandPaletteProps = useForwardProps(
  reactivePick(
    props,
    'icon',
    'placeholder',
    'autofocus',
    'loading',
    'loadingIcon',
    'close',
    'closeIcon',
  ),
)
const proxySlots = omit(slots, ['content'])
const fuse = computed(() =>
  defu({}, props.fuse, {
    fuseOptions: {
      includeMatches: true,
    },
  }),
)
const _ui = computed(() => tv({ extend: tv(theme), ...(appConfig.uiPro?.contentSearch || {}) }))
function mapLinksItems(links) {
  return links.flatMap((link) => [
    {
      ...link,
      suffix: link.description,
      icon: link.icon || appConfig.ui.icons.file,
    },
    ...(link.children?.map((child) => ({
      ...child,
      prefix: link.label + ' >',
      suffix: child.description,
      icon: child.icon || link.icon || appConfig.ui.icons.file,
    })) || []),
  ])
}
function mapNavigationItems(children, parent) {
  return children.flatMap((link) => {
    if (link.children?.length) {
      return mapNavigationItems(link.children, link)
    }
    return (
      props.files
        ?.filter((file) => file.id === link.path || file.id.startsWith(`${link.path}#`))
        ?.map((file) => mapFile(file, link, parent)) || []
    )
  })
}
function mapFile(file, link, parent) {
  const prefix = [...new Set([parent?.title, ...file.titles].filter(Boolean))]
  return {
    prefix: prefix?.length ? prefix.join(' > ') + ' >' : void 0,
    label: file.id === link.path ? link.title : file.title,
    suffix: file.content.replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
    to: file.id,
    icon:
      link.icon ||
      parent?.icon ||
      (file.level > 1 ? appConfig.ui.icons.hash : appConfig.ui.icons.file),
    level: file.level,
  }
}
const groups = computed(() => {
  const groups2 = []
  if (props.links?.length) {
    groups2.push({
      id: 'links',
      label: t('contentSearch.links'),
      items: mapLinksItems(props.links),
    })
  }
  if (props.navigation?.length) {
    if (props.navigation.some((link) => !!link.children?.length)) {
      groups2.push(
        ...props.navigation.map((group) => ({
          id: group.path,
          label: group.title,
          items: mapNavigationItems(group.children || [], group),
          postFilter,
        })),
      )
    } else {
      groups2.push({ id: 'docs', items: mapNavigationItems(props.navigation, null), postFilter })
    }
  }
  groups2.push(...(props.groups || []))
  if (props.colorMode && !_colorMode?.forced) {
    groups2.push({
      id: 'theme',
      label: t('contentSearch.theme'),
      items: [
        {
          label: t('colorMode.system'),
          icon: appConfig.ui.icons.system,
          active: _colorMode.preference === 'system',
          onSelect: () => {
            _colorMode.preference = 'system'
          },
        },
        {
          label: t('colorMode.light'),
          icon: appConfig.ui.icons.light,
          active: _colorMode.preference === 'light',
          onSelect: () => {
            _colorMode.preference = 'light'
          },
        },
        {
          label: t('colorMode.dark'),
          icon: appConfig.ui.icons.dark,
          active: _colorMode.preference === 'dark',
          onSelect: () => {
            _colorMode.preference = 'dark'
          },
        },
      ],
    })
  }
  return groups2
})

function postFilter(query, items) {
  if (!query) {
    return items?.filter((item) => item.level === 1)
  }
  return items
}
function onSelect(item) {
  if (item.disabled) {
    return
  }
  open.value = false
  searchTerm.value = ''
}
defineShortcuts({
  [props.shortcut]: {
    usingInput: true,
    handler: () => (open.value = !open.value),
  },
})
const commandPaletteRef = useTemplateRef('commandPaletteRef')
defineExpose({
  commandPaletteRef,
})
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ ...(_ui().modal || {}), overlay: _ui().modal?.overlay }"
    :class="[props.class, props.ui?.modal]"
  >
    <template #content>
      <slot name="content">
        <UCommandPalette
          ref="commandPaletteRef"
          v-model:search-term="searchTerm"
          v-bind="commandPaletteProps"
          :groups="groups"
          :fuse="fuse"
          :ui="transformUI({ ...omit(_ui(), ['modal']), ...props.ui })"
          @update:model-value="onSelect"
          @update:open="open = $event"
        >
          <template v-for="(_, name) in proxySlots" :key="name" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </UCommandPalette>
      </slot>
    </template>
  </UModal>
</template>
