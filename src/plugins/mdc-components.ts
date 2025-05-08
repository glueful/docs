// Import your static components
import PageHero from '@/components/page/PageHero.vue'
import PageSection from '@/components/page/PageSection.vue'
import PageFeature from '@/components/page/PageFeature.vue'
import PageCTA from '@/components/page/PageCTA.vue'
import ProsePre from '@/components/content/Prose/ProsePre.vue'
import Button from '@/components/elements/Button.vue'
import Separator from '@/components/elements/Separator.vue'
import Icon from '@/components/elements/Icon.vue'

// Import prose components
import ProseP from '@/components/content/Prose/ProseP.vue'
import ProseH1 from '@/components/content/Prose/ProseH1.vue'
import ProseH2 from '@/components/content/Prose/ProseH2.vue'
import ProseH3 from '@/components/content/Prose/ProseH3.vue'
import ProseH4 from '@/components/content/Prose/ProseH4.vue'
import ProseUl from '@/components/content/Prose/ProseUl.vue'
import ProseOl from '@/components/content/Prose/ProseOl.vue'
import ProseLi from '@/components/content/Prose/ProseLi.vue'
import ProseA from '@/components/content/Prose/ProseA.vue'
import ProseBlockquote from '@/components/content/Prose/ProseBlockquote.vue'
import ProseCode from '@/components/content/Prose/ProseCode.vue'
import ProseImg from '@/components/content/Prose/ProseImg.vue'
import ProseTable from '@/components/content/Prose/ProseTable.vue'
import ProseTableHead from '@/components/content/Prose/ProseThead.vue'
import ProseTableBody from '@/components/content/Prose/ProseTbody.vue'
import ProseTableRow from '@/components/content/Prose/ProseTr.vue'
import ProseTableHeader from '@/components/content/Prose/ProseTh.vue'
import ProseTableData from '@/components/content/Prose/ProseTd.vue'
import ProseHr from '@/components/content/Prose/ProseHr.vue'
import ProseStrong from '@/components/content/Prose/ProseStrong.vue'
import ProseEm from '@/components/content/Prose/ProseEm.vue'
import CodePreview from '@/components/content/Prose/ProseCodePreview.vue'
import CodeGroup from '@/components/content/Prose/ProseCodeGroup.vue'
import ProseCard from '@/components/content/Prose/ProseCard.vue'

// Component map for MDC
export const mdcComponents = {
  // Page components
  'page-hero': PageHero,
  'page-section': PageSection,
  'page-feature': PageFeature,
  'page-cta': PageCTA,
  'prose-pre': ProsePre,
  'u-button': Button,
  'u-separator': Separator,
  'u-icon': Icon,
  'code-preview': CodePreview,
  'code-group': CodeGroup,
  card: ProseCard,

  // Prose components for standard HTML elements
  p: ProseP,
  h1: ProseH1,
  h2: ProseH2,
  h3: ProseH3,
  h4: ProseH4,
  ul: ProseUl,
  ol: ProseOl,
  li: ProseLi,
  a: ProseA,
  blockquote: ProseBlockquote,
  code: ProseCode,
  img: ProseImg,
  table: ProseTable,
  thead: ProseTableHead,
  tbody: ProseTableBody,
  tr: ProseTableRow,
  th: ProseTableHeader,
  td: ProseTableData,
  hr: ProseHr,
  strong: ProseStrong,
  em: ProseEm,
  pre: ProsePre,
}
