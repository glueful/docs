import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
const processedRoutes = setupLayouts(routes)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: processedRoutes,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
