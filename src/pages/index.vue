<script setup lang="ts">
// Use Vite's raw import feature for markdown
import useMarkdownParser from '@/components/content/composables/useMarkdownParser'
import contentRaw from '@/content/index.md?raw'
import { onBeforeMount, onMounted, ref, nextTick } from 'vue'

const appear = ref(false)
const appeared = ref(false)
const isLoading = ref(false)
const ast = ref<any>(null)
const { parse } = useMarkdownParser()

// Interactive features
const stats = ref({
  developers: 0,
  apis: 0,
  uptime: 0,
})

const targetStats = {
  developers: 10000,
  apis: 1500000,
  uptime: 99.9,
}

// Animate numbers
const animateNumber = (
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void,
) => {
  const startTime = performance.now()
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function for smooth animation
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
    const value = start + (end - start) * easeOutCubic(progress)

    callback(Math.floor(value))

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}

// Typing animation for terminal
const setupTypingAnimation = () => {
  nextTick(() => {
    const elements = document.querySelectorAll('.typing-animation')
    elements.forEach((element) => {
      const text = element.textContent || ''
      element.textContent = ''

      let i = 0
      const typeInterval = setInterval(() => {
        element.textContent += text[i]
        i++
        if (i >= text.length) {
          clearInterval(typeInterval)
        }
      }, 50)
    })
  })
}

// Intersection Observer for animations
const setupScrollAnimations = () => {
  nextTick(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')

            // Trigger number animations when stats section is visible
            if (entry.target.classList.contains('stats-section')) {
              animateNumber(0, targetStats.developers, 2000, (value) => {
                stats.value.developers = value
              })
              animateNumber(0, targetStats.apis, 2500, (value) => {
                stats.value.apis = value
              })
              animateNumber(0, targetStats.uptime, 1500, (value) => {
                stats.value.uptime = value / 10
              })
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      },
    )

    // Observe elements for scroll animations
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el)
    })
  })
}

// Utility functions
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onBeforeMount(async () => {
  isLoading.value = true

  ast.value = await parse(contentRaw)
  isLoading.value = false
  appear.value = true
  setTimeout(() => {
    appeared.value = true
  }, 400)
})

onMounted(() => {
  setupTypingAnimation()
  setupScrollAnimations()
})
</script>

<template>
  <AppHeader />
  <Suspense>
    <template #default>
      <Main class="relative overflow-hidden" v-if="ast">
        <!-- Content with enhanced animations -->
        <div class="relative z-10">
          <ContentRenderer :value="ast" />
        </div>

        <!-- Interactive floating action button -->
        <div class="fixed bottom-8 right-8 z-50">
          <UButton
            class="bg-primary-700 hover:bg-primary-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
            @click="scrollToTop"
            title="Back to top"
          >
            <svg
              class="w-4 h-4 transform group-hover:-translate-y-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              ></path>
            </svg>
          </UButton>
        </div>
      </Main>
    </template>
    <template #fallback>
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"
          ></div>
          <p class="text-gray-500 animate-pulse">Loading Glueful...</p>
        </div>
      </div>
    </template>
  </Suspense>
  <AppFooter />
</template>
