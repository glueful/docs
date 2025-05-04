import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ui from '@nuxt/ui/vue-plugin'

import 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-markup-templating'
import { createHead } from '@unhead/vue/client'

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(router)
app.use(ui)

app.mount('#app')
