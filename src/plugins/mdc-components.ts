// Plugin to register components for MDC

// Import your components
import PageHero from '@/components/page/PageHero.vue'
import PageSection from '@/components/page/PageSection.vue'
import PageFeature from '@/components/page/PageFeature.vue'
import PageCTA from '@/components/page/PageCTA.vue'
import ProsePre from '@/components/content/Prose/ProsePre.vue'
import Button from '@/components/elements/Button.vue'

// Component map for MDC
export const mdcComponents = {
  // Page components
  'page-hero': PageHero,
  'page-section': PageSection,
  'page-feature': PageFeature,
  'page-cta': PageCTA,
  'prose-pre': ProsePre,
  'u-button': Button,

  // Prose components for standard HTML elements
}
