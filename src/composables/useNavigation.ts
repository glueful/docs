import { ref, type Ref, onMounted } from 'vue'

// Import all markdown files from the content directory
// These imports must be static strings for Vite to process them at build time
const contentFiles = import.meta.glob('/src/content/**/*.md', { eager: true })

export interface ContentNavigationItem {
  title: string
  path: string
  icon?: string
  active?: boolean
  children?: ContentNavigationItem[]
}

export interface UseNavigationOptions {
  // Static navigation data to use instead of fetching
  staticNavigation?: ContentNavigationItem[]
  // API endpoint to fetch navigation from, defaults to '/api/content/navigation'
  apiEndpoint?: string
  // Whether to fetch navigation on mount
  fetchOnMount?: boolean
  // Base path for content folder to build navigation from
  contentFolderBase?: string
}

/**
 * Composable for building navigation from the content directory structure
 */
export function useNavigation(options: UseNavigationOptions = {}) {
  const navigation: Ref<ContentNavigationItem[]> = ref([])
  const isLoading = ref(true)
  const error = ref<Error | null>(null)

  /**
   * Generate a title from a path segment
   */
  function generateTitle(path: string): string {
    return path
      .split(/[\s-]/g)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Build navigation tree from content directory structure
   */
  async function buildNavigation() {
    isLoading.value = true
    error.value = null

    try {
      // Use static navigation if provided
      if (options.staticNavigation) {
        navigation.value = processNavigationData(options.staticNavigation)
        isLoading.value = false
        return
      }

      // If content folder base is specified, build navigation from content files
      if (options.contentFolderBase !== undefined) {
        buildNavigationFromContentFiles(options.contentFolderBase)
        return
      }

      // Otherwise fetch from API
      const apiUrl = options.apiEndpoint || '/api/content/navigation'
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error('Failed to fetch navigation data')
      }

      const data = await response.json()
      navigation.value = processNavigationData(data)
    } catch (err) {
      console.error('Error building navigation:', err)
      error.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Build navigation from content files imported via import.meta.glob
   */
  function buildNavigationFromContentFiles(basePath: string = '/src/content') {
    try {
      // Process the modules to build navigation
      const folderStructure: Record<string, any> = {}

      // Process each file and organize by folders
      Object.entries(contentFiles).forEach(([path, module]) => {
        // Skip files that don't match our base path
        if (!path.startsWith(basePath)) return

        // Extract folder and file information from path
        const pathParts = path.replace(`${basePath}/`, '').split('/')
        const fileName = pathParts.pop() || ''
        const folderParts = pathParts

        // Skip files starting with . (like .navigation.md)
        if (fileName.startsWith('.')) return

        // Extract metadata from the module if available
        // @ts-expect-error - Module structure is dynamic
        const frontmatter = module.frontmatter || {}

        // Skip if navigation is explicitly set to false
        if (frontmatter.navigation === false) return

        // Build folder structure
        let currentLevel = folderStructure

        folderParts.forEach((part) => {
          // Clean folder name (remove numeric prefix)
          const cleanPart = part.replace(/^\d+\./, '')

          if (!currentLevel[cleanPart]) {
            // Create folder entry if it doesn't exist
            currentLevel[cleanPart] = {
              title: generateTitle(cleanPart),
              path: `#${cleanPart}`,
              children: {},
              isDirectory: true,
              // Extract numeric prefix for sorting if it exists
              order: part.match(/^(\d+)\./)?.[1]
                ? parseInt(part.match(/^(\d+)\./)?.[1] || '999')
                : 999,
            }
          }

          // Move to next level
          currentLevel = currentLevel[cleanPart].children
        })

        // Clean file name (remove numeric prefix and extension)
        const cleanFileName = fileName.replace(/^\d+\.|\.\w+$/g, '')
        const isIndex = cleanFileName === 'index'

        // Set page information
        if (!isIndex || Object.keys(currentLevel).length === 0) {
          currentLevel[cleanFileName] = {
            title: frontmatter.title || generateTitle(cleanFileName),
            path:
              folderParts.length > 0
                ? `#${folderParts.map((p) => p.replace(/^\d+\./, '')).join('/')}/${cleanFileName}`
                : `#${cleanFileName}`,
            order: fileName.match(/^(\d+)\./)?.[1]
              ? parseInt(fileName.match(/^(\d+)\./)?.[1] || '999')
              : 999,
            ...frontmatter.navigation,
          }
        }

        // Special handling for index files - apply to parent if needed
        if (isIndex && folderParts.length > 0) {
          const parentPath = folderParts.slice(0, -1)
          let parent = folderStructure

          // Navigate to the parent folder
          for (const part of parentPath) {
            const cleanPart = part.replace(/^\d+\./, '')
            parent = parent[cleanPart]?.children || {}
          }

          // Get the folder this index belongs to
          const folderName = folderParts[folderParts.length - 1].replace(/^\d+\./, '')

          // Apply index metadata to parent folder if it exists
          if (frontmatter.title && parent[folderName]) {
            parent[folderName].title = frontmatter.title
          }
        }
      })

      // Convert the folder structure to the navigation format
      const nav = convertStructureToNavigation(folderStructure)
      navigation.value = nav
    } catch (err) {
      console.error('Error building navigation from content files:', err)
      error.value =
        err instanceof Error ? err : new Error('Failed to build navigation from content files')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Convert the hierarchical folder structure to flat navigation array
   */
  function convertStructureToNavigation(structure: Record<string, any>): ContentNavigationItem[] {
    return Object.values(structure)
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        if (item.isDirectory) {
          // Convert children object to array and sort by order
          const children = Object.values(item.children)
            .sort((a: any, b: any) => a.order - b.order)
            .map((child: any) => {
              if (child.isDirectory) {
                const subChildren = convertStructureToNavigation(child.children)
                return {
                  title: child.title,
                  path: child.path,
                  icon: child.icon,
                  ...(subChildren.length > 0 && { children: subChildren }),
                }
              } else {
                return {
                  title: child.title,
                  path: child.path,
                  active: child.active || false,
                  ...(child.icon && { icon: child.icon }),
                }
              }
            })

          return {
            title: item.title,
            path: item.path,
            icon: item.icon || `i-lucide-${item.title.toLowerCase().replace(/\s+/g, '-')}`,
            ...(children.length > 0 && { children }),
          }
        } else {
          return {
            title: item.title,
            path: item.path,
            active: item.active || false,
            ...(item.icon && { icon: item.icon }),
          }
        }
      })
  }

  /**
   * Process raw navigation data into the expected format
   */
  function processNavigationData(data: any[]): ContentNavigationItem[] {
    return data.map((item) => ({
      title: item.title,
      path: item.path,
      icon: item.icon || `i-lucide-${item.title.toLowerCase().replace(/\s+/g, '-')}`,
      active: item.active || false,
      ...(item.children && { children: processNavigationData(item.children) }),
    }))
  }

  /**
   * Set active navigation item based on current path
   */
  function setActivePath(path: string) {
    const markActive = (items: ContentNavigationItem[]): boolean => {
      let foundActive = false

      for (const item of items) {
        // Check if this item matches the path
        const isActive = item.path === path
        item.active = isActive

        // Check children recursively
        if (item.children?.length) {
          const hasActiveChild = markActive(item.children)
          if (hasActiveChild) {
            foundActive = true
          }
        }

        if (isActive) {
          foundActive = true
        }
      }

      return foundActive
    }

    markActive(navigation.value)
  }

  // Initialize navigation on component mount if requested
  onMounted(() => {
    if (options.fetchOnMount !== false) {
      buildNavigation()
    }
  })

  return {
    navigation,
    isLoading,
    error,
    buildNavigation,
    setActivePath,
  }
}
