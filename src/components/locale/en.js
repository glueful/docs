import { en } from '@nuxt/ui/locale'
import { defineLocale } from '../composables/defineLocale'
export default defineLocale({
  ...en,
  messages: {
    ...en.messages,
    authForm: {
      submit: 'Continue',
      hidePassword: 'Hide password',
      showPassword: 'Show password',
    },
    banner: {
      close: 'Close',
    },
    chatPrompt: {
      placeholder: 'Type your message here...',
    },
    chatPromptSubmit: {
      label: 'Send prompt',
    },
    colorMode: {
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
    },
    contentSearch: {
      links: 'Links',
      theme: 'Theme',
    },
    contentSearchButton: {
      label: 'Search...',
    },
    contentToc: {
      title: 'On this page',
    },
    dashboardSearch: {
      theme: 'Theme',
    },
    dashboardSearchButton: {
      label: 'Search...',
    },
    dashboardSidebarCollapse: {
      expand: 'Expand sidebar',
      collapse: 'Collapse sidebar',
    },
    dashboardSidebarToggle: {
      close: 'Close sidebar',
      open: 'Open sidebar',
    },
    error: {
      clear: 'Back to home',
    },
    header: {
      close: 'Close menu',
      open: 'Open menu',
    },
    pricingTable: {
      caption: 'Pricing plan comparison',
    },
    prose: {
      codeCollapse: {
        name: 'code',
        openText: 'Expand',
        closeText: 'Collapse',
      },
      collapsible: {
        name: 'properties',
        openText: 'Show',
        closeText: 'Hide',
      },
      pre: {
        copy: 'Copy code to clipboard',
      },
    },
  },
})
