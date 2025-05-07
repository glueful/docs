import useMarkdownParser from '@/components/content/composables/useMarkdownParser'

// Use Vite's glob import feature to get all markdown files
const contentModules = import.meta.glob('/src/content/**/*.md', { as: 'raw', eager: true })

/**
 * Maps a route path to possible content file paths
 * For example: "/getting-started/installation" -> [
 *   "/src/content/1.getting-started/2.installation.md",
 *   "/src/content/1.getting-started/installation.md"
 * ]
 */
function routeToContentPath(routePath: string): string[] {
  // Handle index route
  if (routePath === '/' || routePath === '') {
    return ['/src/content/index.md']
  }

  // Remove leading slash
  const normalizedPath = routePath.startsWith('/') ? routePath.substring(1) : routePath

  // Split path into segments
  const segments = normalizedPath.split('/')

  // Generate possible paths
  const possiblePaths: any = []

  // Generate paths with any potential numeric prefixes
  const allContentPaths = Object.keys(contentModules)

  // Try to find an exact match with numeric prefixes
  // const pathsToCheck = []

  // One segment (top-level page)
  if (segments.length === 1) {
    const segmentPattern = new RegExp(`\\d+\\.${segments[0]}[\\/]\\d+\\.index\\.md$`)
    const indexPattern = new RegExp(`\\d+\\.${segments[0]}\\.md$`)

    allContentPaths.forEach((path) => {
      if (segmentPattern.test(path) || indexPattern.test(path)) {
        possiblePaths.push(path)
      }
    })
  }
  // Multiple segments (nested page)
  else if (segments.length > 1) {
    // Try to match each segment pattern
    let basePattern = ''
    for (let i = 0; i < segments.length - 1; i++) {
      basePattern += `\\d+\\.${segments[i]}\\/`
    }

    // Final segment can be index.md or named.md
    const filePattern = new RegExp(`${basePattern}\\d+\\.${segments[segments.length - 1]}\\.md$`)

    allContentPaths.forEach((path) => {
      if (filePattern.test(path)) {
        possiblePaths.push(path)
      }
    })
  }

  return possiblePaths
}

export default function useContentQuery() {
  const { parse } = useMarkdownParser()

  /**
   * Find content by route path, parse it, and return the AST
   * Similar to queryCollection('docs').path(route.path).first() in Nuxt
   */
  async function findOne(routePath: string) {
    // Get possible content file paths for this route
    const contentPaths = routeToContentPath(routePath)

    // Find the first matching content file
    for (const path of contentPaths) {
      if (contentModules[path]) {
        // Found a matching file
        const content = contentModules[path]

        // Parse the markdown content
        const ast = await parse(content)
        return { ast }
      }
    }

    // No matching content found
    return null
  }

  /**
   * Find all content matching a path pattern
   */
  async function find(pathPattern: string) {
    const results = []
    const pattern = new RegExp(pathPattern)

    for (const path in contentModules) {
      if (pattern.test(path)) {
        const content = contentModules[path]
        const ast = await parse(content)
        results.push({ ast })
      }
    }

    return results
  }

  return {
    findOne,
    find,
  }
}
