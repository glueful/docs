export type { Toc, TocLink } from '@nuxtjs/mdc'
export interface ContentNavigationItem {
  title: string
  path: string
  stem?: string
  children?: ContentNavigationItem[]
  page?: false

  [key: string]: unknown
}
