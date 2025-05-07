// Browser-compatible navigation generator
// Instead of using gray-matter directly, we'll implement simple frontmatter parsing

// Use Vite's glob import feature to get all markdown files
const contentModules = import.meta.glob('/src/content/**/*.md', { as: 'raw', eager: true })
const navigationModules = import.meta.glob('/src/content/**/.navigation.yml', {
  as: 'raw',
  eager: true,
})

/**
 * Simple browser-compatible frontmatter parser
 */
function parseFrontmatter(content: any) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n/)
  if (!match) return { data: {}, content }

  const frontmatter = match[1]
  const remainingContent = content.slice(match[0].length)

  // Parse YAML content
  const data = parseYaml(frontmatter)

  return { data, content: remainingContent }
}

/**
 * Parse YAML content
 */
function parseYaml(content: any) {
  const data: any = {}

  // Split the content by lines and parse each line
  content.split(/\r?\n/).forEach((line: any) => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) return

    const colonIndex = line.indexOf(':')
    if (colonIndex !== -1) {
      // Extract key and value
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()

      // Skip if key is empty
      if (!key) return

      // Handle nested objects (indentation-based)
      if (key.startsWith('  ') || key.startsWith('\t')) {
        // This is a nested property, which we're not handling in this simple parser
        // For a full implementation, we'd need to track indentation levels
        return
      }

      // Handle nested properties using dot notation
      if (key.includes('.')) {
        const parts = key.split('.')
        let current: any = data
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {}
          current = current[parts[i]]
        }
        current[parts[parts.length - 1]] = parseValue(value)
      } else {
        data[key] = parseValue(value)
      }
    }
  })

  return data
}

/**
 * Parse a YAML value with basic type conversion
 */
function parseValue(value: any) {
  if (!value) return ''
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^[0-9]+$/.test(value)) return parseInt(value, 10)
  if (/^[0-9]*\.[0-9]+$/.test(value)) return parseFloat(value)

  // Remove quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

/**
 * Generate navigation structure from content directory
 */
export async function generateNavigation() {
  const navigation = []
  const contentPaths = Object.keys(contentModules)

  // Extract top-level sections from content paths
  const sectionRegex = /^\/src\/content\/(\d+\.[^/]+)\//
  const sections = Array.from(
    new Set(
      contentPaths
        .map((path) => {
          const match = path.match(sectionRegex)
          return match ? match[1] : null
        })
        .filter(Boolean) as string[],
    ),
  ).sort((a: string, b: string) => {
    // Sort by numeric prefix
    const numA = parseInt((a.match(/^(\d+)\./) || ['0', '0'])[1])
    const numB = parseInt((b.match(/^(\d+)\./) || ['0', '0'])[1])
    return numA - numB
  })

  // Process each section
  for (const section of sections) {
    const sectionName = section.replace(/^\d+\./, '') // Remove numeric prefix

    // Find section index file
    const indexPath = `/src/content/${section}/1.index.md`
    const indexContent = contentModules[indexPath]
    const sectionMeta = indexContent ? parseFrontmatter(indexContent).data : {}

    // Look for navigation config
    const navConfigPath = `/src/content/${section}/.navigation.yml`
    let navConfig: any = {}
    if (navigationModules[navConfigPath]) {
      try {
        // Parse the YAML content using our custom parser instead of JSON.parse
        navConfig = parseYaml(navigationModules[navConfigPath])
      } catch (e) {
        console.error('Error parsing navigation YAML:', e)
      }
    }

    // Create section item
    const sectionItem = {
      title: sectionMeta.title || formatTitle(sectionName),
      path: `/${sectionName}`,
      icon: sectionMeta.navigation?.icon || navConfig.icon,
      children: processSection(section, sectionName),
    }

    navigation.push(sectionItem)
  }

  return navigation
}

/**
 * Process files within a section
 */
function processSection(section: any, sectionBaseName: any) {
  const items: any = []
  const sectionPathPrefix = `/src/content/${section}/`
  const sectionFiles = Object.keys(contentModules).filter(
    (path) => path.startsWith(sectionPathPrefix) && !path.endsWith('/1.index.md'),
  )

  // Group files by directories
  const filesByDir: any = {}
  const topLevelFiles: any = []

  sectionFiles.forEach((filePath) => {
    // Extract relative path within the section
    const relativePath = filePath.substring(sectionPathPrefix.length)

    if (relativePath.includes('/')) {
      // This is a file in a subdirectory
      const dirName = relativePath.substring(0, relativePath.indexOf('/'))
      if (!filesByDir[dirName]) {
        filesByDir[dirName] = []
      }
      filesByDir[dirName].push(filePath)
    } else {
      // This is a top-level file
      topLevelFiles.push(filePath)
    }
  })

  // Process top-level files
  topLevelFiles
    .filter((filePath: any) => !filePath.endsWith('index.md'))
    .sort(sortByNumericPrefix)
    .forEach((filePath: any) => {
      const content = contentModules[filePath]
      const { data } = parseFrontmatter(content)

      const fileName = filePath
        .split('/')
        .pop()
        .replace(/^\d+\./, '')
        .replace(/\.md$/, '')

      items.push({
        title: data.title || formatTitle(fileName),
        path: `/${sectionBaseName}/${fileName}`,
        icon: data.navigation?.icon,
        badge: data.navigation?.badge,
      })
    })

  // Process subdirectories
  Object.keys(filesByDir)
    .sort(sortByNumericPrefix)
    .forEach((dirName) => {
      const cleanDirName = dirName.replace(/^\d+\./, '')
      const dirFiles = filesByDir[dirName]

      // Find index file for the directory
      const indexFile = dirFiles.find(
        (file: any) => file.endsWith('/index.md') || file.endsWith('/1.index.md'),
      )
      const dirMeta = indexFile ? parseFrontmatter(contentModules[indexFile]).data : {}

      const children = processDirFiles(dirFiles, `/${sectionBaseName}/${cleanDirName}`)

      items.push({
        title: dirMeta.title || formatTitle(cleanDirName),
        path: `/${sectionBaseName}/${cleanDirName}`,
        icon: dirMeta.navigation?.icon,
        children,
      })
    })

  return items
}

/**
 * Process files within a directory
 */
function processDirFiles(filePaths: any, basePath: string) {
  const items: any = []

  filePaths
    .filter((path: any) => !path.endsWith('index.md') && !path.endsWith('1.index.md'))
    .sort(sortByNumericPrefix)
    .forEach((filePath: any) => {
      const content = contentModules[filePath]
      const { data } = parseFrontmatter(content)

      const fileName = filePath
        .split('/')
        .pop()
        .replace(/^\d+\./, '')
        .replace(/\.md$/, '')

      items.push({
        title: data.title || formatTitle(fileName),
        path: `${basePath}/${fileName}`,
        icon: data.navigation?.icon,
        badge: data.navigation?.badge,
      })
    })

  return items
}

/**
 * Helper to sort by numeric prefix
 */
function sortByNumericPrefix(a: any, b: any) {
  // Extract filename from path
  const fileA = a.split('/').pop() || ''
  const fileB = b.split('/').pop() || ''

  // Extract numeric prefix
  const numA = parseInt((fileA.match(/^(\d+)\./) || ['0', '0'])[1])
  const numB = parseInt((fileB.match(/^(\d+)\./) || ['0', '0'])[1])

  return numA - numB
}

/**
 * Format a slug as a title
 */
function formatTitle(slug: any) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char: any) => char.toUpperCase())
}
