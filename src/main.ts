import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ui from '@nuxt/ui/vue-plugin'
import { createHead } from '@unhead/vue/client'

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(router)
app.use(ui)

app.mount('#app')
