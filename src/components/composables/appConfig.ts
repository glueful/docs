// Example implementation of useAppConfig

import { reactive, readonly } from 'vue'

// Default app config structure
const defaultAppConfig = {
  name: 'My App',
  description: 'A simple app',
  ui: {
    icons: {
      eye: 'i-heroicons-eye',
      eyeOff: 'i-heroicons-eye-slash',
      menu: 'i-lucide-menu',
      close: 'i-lucide-x',
      panelOpen: 'i-lucide-menu',
      panelClose: 'i-lucide-menu',
      dark: 'i-heroicons-moon',
      light: 'i-heroicons-sun',
      chevronDown: 'i-heroicons-chevron-down',
      external: 'i-heroicons-external-link',
      folderOpen: 'i-heroicons-folder-open',
      folder: 'i-heroicons-folder',
      hash: 'i-heroicons-hashtag',
      copyCheck: 'i-heroicons-check',
      copy: 'i-heroicons-document-duplicate',
      caution: 'i-heroicons-exclamation',
      info: 'i-heroicons-information-circle',
      tip: 'i-heroicons-light-bulb',
      warning: 'i-heroicons-exclamation-triangle',
    },
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/glueful/docs/tree/main/src/content',
      links: [
        {
          icon: 'i-lucide-star',
          label: 'Star on GitHub',
          to: 'https://github.com/glueful/glueful',
          target: '_blank',
        },
        {
          label: 'Roadmap',
          icon: 'i-lucide-flag',
          to: '/docs/community/roadmap',
        },
        {
          icon: 'i-lucide-disc',
          label: 'Releases',
          to: 'https://github.com/glueful/glueful/releases',
          target: '_blank',
        },
      ],
    },
  },
}

// Create a reactive state
const appConfigState = reactive({ ...defaultAppConfig })

/**
 * Composable that provides access to the application configuration
 * This matches the function imported from '#imports' in the AuthForm.vue
 */
export function useAppConfig() {
  // Return a readonly version of the config to prevent unintended mutations
  return readonly(appConfigState)
}

// Optional: Method to update app config at runtime
export function updateAppConfig(config: Partial<typeof defaultAppConfig>) {
  Object.assign(appConfigState, config)
}
