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
