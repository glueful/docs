import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { generateNavigation } from '@/utils/navigationGenerator'

interface NavigationItem {
  title: string
  path: string
  icon?: string
  badge?: string
  children?: NavigationItem[]
}

interface FlatNavigationItem {
  title: string
  path: string
  parent?: string
}

export function useDocsNavigation() {
  const route = useRoute()
  const navigation = ref<NavigationItem[]>([])
  const isLoaded = ref(false)

  // Flatten the navigation tree to create a linear sequence
  const flattenNavigation = (items: NavigationItem[], parent?: string): FlatNavigationItem[] => {
    const result: FlatNavigationItem[] = []
    
    for (const item of items) {
      // Check if this parent item has children
      const hasChildren = item.children && item.children.length > 0
      
      if (hasChildren) {
        // Get the first child's path
        const firstChild = item.children![0]
        
        // Check if parent redirects to first child
        // This happens when parent path + '/' + child-slug equals child path
        // Or when they're structured to auto-redirect
        const parentRedirectsToFirstChild = 
          firstChild.path === item.path ||  // Same path
          firstChild.path === `${item.path}/${firstChild.path.split('/').pop()}` || // Parent/child structure
          firstChild.path.replace(/\/[^/]+$/, '') === item.path // Child's parent dir equals parent path
        
        if (!parentRedirectsToFirstChild) {
          // Parent has its own unique content, add it
          result.push({
            title: item.title,
            path: item.path,
            parent
          })
        }
        
        // Add all children
        result.push(...flattenNavigation(item.children!, item.title))
      } else {
        // No children, just add the item
        if (item.path) {
          result.push({
            title: item.title,
            path: item.path,
            parent
          })
        }
      }
    }
    
    return result
  }

  // Get flattened navigation array
  const flatNavigation = computed(() => {
    if (!navigation.value.length) return []
    return flattenNavigation(navigation.value)
  })

  // Find current page index
  const currentPageIndex = computed(() => {
    const currentPath = route.path
    
    // First, try to find exact match
    let index = flatNavigation.value.findIndex(item => item.path === currentPath)
    
    // If not found and this might be a parent path, check if any item starts with this path
    if (index === -1) {
      // Find all items that start with the current path
      const childPaths = flatNavigation.value
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.path.startsWith(currentPath + '/'))
      
      // If we found children, we're on a parent that defaults to first child
      if (childPaths.length > 0) {
        // Return the index of the first child (which is what's actually being displayed)
        index = childPaths[0].idx
      }
    }
    
    return index
  })

  // Get previous page
  const prevPage = computed(() => {
    const index = currentPageIndex.value
    if (index <= 0) return null
    return flatNavigation.value[index - 1]
  })

  // Get next page
  const nextPage = computed(() => {
    const index = currentPageIndex.value
    if (index === -1 || index >= flatNavigation.value.length - 1) return null
    return flatNavigation.value[index + 1]
  })

  // Load navigation on mount
  const loadNavigation = async () => {
    try {
      navigation.value = await generateNavigation()
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load navigation:', error)
    }
  }

  return {
    navigation,
    flatNavigation,
    prevPage,
    nextPage,
    isLoaded,
    loadNavigation
  }
}