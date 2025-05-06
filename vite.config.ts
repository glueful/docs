import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueRouter from 'unplugin-vue-router/vite'
import ui from '@nuxt/ui/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/], // <-- allows Vue to compile Markdown files
    }),
    VueRouter({
      extensions: ['.vue', '.md'],
    }),
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
    // Provide a polyfill for process.env
    'process.env': {},
  },
})
