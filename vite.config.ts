import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueRouter from 'unplugin-vue-router/vite'
import ui from '@nuxt/ui/vite'
import path from 'path'
import Layouts from 'vite-plugin-vue-layouts-next'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/], // <-- allows Vue to compile Markdown files
    }),
    VueRouter({
      extensions: ['.vue', '.md'],
    }),
    Layouts(),
    ui({
      ui: {
        icons: {
          loading: 'i-lucide-loader-circle',
        },
        button: {
          slots: {
            base: ['cursor-pointer'],
          },
        },
        dropdownMenu: {
          slots: {
            item: ['cursor-pointer'],
          },
        },
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#mdc-imports': path.resolve(__dirname, './stub-mdc-imports.js'),
      '#mdc-configs': path.resolve(__dirname, './stub-mdc-imports.js'),
    },
  },
  define: {
    // Provide polyfills for Node.js globals
    'process.env': {},
    // Define process for libraries that use it directly
    process: JSON.stringify({
      env: {},
      platform: '',
      version: '',
      versions: {},
    }),
    // Define global for libraries that use it
    global: 'globalThis',
  },
})
