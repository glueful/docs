import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Error state that can be used across the application
 */
export const error: Ref<Error | null> = ref(null)

/**
 * Set the current error
 * @param err The error to set
 */
export const setError = (err: Error | null) => {
  error.value = err
}

/**
 * Clear the current error and optionally redirect to another page
 * @param options Options for error clearing
 * @returns Promise that resolves when redirection is complete (if applicable)
 */
export const clearError = async (options: { redirect?: string } = {}) => {
  // Emit an event that error has been cleared (optional)
  // You can use mitt or another event bus if needed

  // Handle redirection if requested
  if (options.redirect) {
    const router = useRouter()
    await router.replace(options.redirect)
  }

  // Clear the error state
  error.value = null
}

/**
 * Vue composition function to use error handling
 * @returns Object with error state and methods to set/clear errors
 */
export const useErrorHandling = () => {
  return {
    error,
    setError,
    clearError,
  }
}
