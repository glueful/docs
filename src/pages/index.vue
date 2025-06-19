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
        <!-- Enhanced Hero Background with Particles -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <!-- <HeroBackground
            class="absolute w-full -top-px transition-all shrink-0"
            :class="[
              isLoading ? 'animate-pulse' : appear ? '' : 'opacity-0',
              appeared ? 'duration-[400ms]' : 'duration-1000',
            ]"
          /> -->

          <!-- Floating particles animation -->
          <div class="absolute inset-0">
            <div
              class="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-float opacity-60"
            ></div>
            <div
              class="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float-delayed opacity-40"
            ></div>
            <div
              class="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-float-slow opacity-30"
            ></div>
            <div
              class="absolute top-2/3 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-float opacity-50"
            ></div>
          </div>
        </div>

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

<style scoped>
/* Custom animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes float-delayed {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(-180deg);
  }
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse-neon {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(102, 126, 234, 0.3),
      0 0 40px rgba(102, 126, 234, 0.1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(102, 126, 234, 0.6),
      0 0 60px rgba(102, 126, 234, 0.3);
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 4s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

/* Enhanced gradient text effects */
.gradient-text {
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 4s ease-in-out infinite;
}

/* Neon glow effects */
.hover-glow:hover {
  animation: pulse-neon 2s ease-in-out infinite;
}

/* Terminal cursor effect */
.terminal-cursor::after {
  content: '|';
  animation: blink 1s infinite;
}

/* Global scroll animations */
:global(.animate-on-scroll) {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
}

:global(.animate-on-scroll.animate-fade-in-up) {
  opacity: 1;
  transform: translateY(0);
}

/* Global gradient animations */
:global(.animate-gradient) {
  background-size: 300% 300%;
  animation: gradient-shift 4s ease-in-out infinite;
}

/* Enhanced floating particles */
.floating-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  animation: particle-float 8s linear infinite;
}

@keyframes particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}
</style>
