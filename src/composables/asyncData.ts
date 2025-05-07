import { ref, shallowRef, computed, watch, onUnmounted } from 'vue'
import type { Ref, MaybeRefOrGetter } from 'vue'
import { debounce } from 'perfect-debounce' // Assuming you want to keep this dependency

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

export type AsyncDataExecuteOptions = {
  /**
   * Force a refresh, even if there is already a pending request
   * Previous requests will not be cancelled, but their result will not affect the data/pending state
   */
  dedupe?: 'cancel' | 'defer'

  /**
   * The cause of the refresh (for debugging or tracking purposes)
   */
  cause?: string
}

export interface UseAsyncOptions<ResT, DataT = ResT, DefaultT = undefined> {
  /**
   * When set to false, will prevent the request from firing immediately
   * @default true
   */
  immediate?: boolean

  /**
   * A factory function to set the default value of the data before the async function resolves
   * Useful with immediate: false option
   */
  default?: () => DefaultT

  /**
   * A function that can be used to transform the handler function result after resolving
   */
  transform?: (input: ResT) => DataT | Promise<DataT>

  /**
   * Watch reactive sources to auto-refresh when changed
   */
  watch?: any[] | (() => any)

  /**
   * Return data in a deep ref object (default is true)
   * Set to false to return data in a shallow ref object for better performance
   */
  deep?: boolean

  /**
   * Avoid fetching the same key more than once at a time
   * @default 'cancel'
   */
  dedupe?: 'cancel' | 'defer'
}

export interface AsyncData<DataT, ErrorT> {
  /**
   * The data returned by the handler function once resolved
   */
  data: Ref<DataT>

  /**
   * Whether the async function is currently loading
   */
  pending: Ref<boolean>

  /**
   * Error object if the handler function fails to resolve
   */
  error: Ref<ErrorT | undefined>

  /**
   * Current status of the async request
   */
  status: Ref<AsyncStatus>

  /**
   * Function to refresh the data by running the handler again
   */
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>

  /**
   * Alias for refresh
   */
  execute: (opts?: AsyncDataExecuteOptions) => Promise<void>

  /**
   * Clear the data and reset to default values
   */
  clear: () => void
}

const DEFAULTS = {
  deep: true,
  immediate: true,
  dedupe: 'cancel' as const,
  default: () => undefined as any,
}

// A map to store promises for deduplication
const asyncPromises = new Map<string, Promise<any>>()

/**
 * Provides access to data that resolves asynchronously
 *
 * @param key A unique key to ensure that data fetching can be properly de-duplicated
 * @param handler An asynchronous function that returns the data
 * @param options customize the behavior of useAsync
 */
export function useAsync<ResT, DataT = ResT, DefaultT = undefined>(
  key: MaybeRefOrGetter<string>,
  handler: () => Promise<ResT>,
  options: UseAsyncOptions<ResT, DataT, DefaultT> = {},
): AsyncData<DataT | DefaultT, Error> {
  // Apply defaults
  const _options = { ...DEFAULTS, ...options }
  const _key = typeof key === 'function' ? computed(key) : ref(key)

  // Use appropriate ref based on the deep option
  const _ref = _options.deep ? ref : shallowRef

  // Create reactive state
  const data = _ref<DataT | DefaultT>(_options.default() as DefaultT) as Ref<DataT | DefaultT>
  const error = ref<Error | undefined>()
  const status = ref<AsyncStatus>('idle')
  const pending = computed(() => status.value === 'pending')

  // Create a cancel token
  let canceled = false

  // Define the execute function with deduplication
  const _execute = async (opts: AsyncDataExecuteOptions = {}): Promise<void> => {
    // Avoid fetching same key more than once at a time
    if (asyncPromises.has(_key.value)) {
      if ((opts.dedupe ?? _options.dedupe) === 'defer') {
        // Wait for the current promise to resolve
        await asyncPromises.get(_key.value)!
        return
      }

      // Cancel the current promise (will be ignored in then/catch)
      canceled = true
    }

    // Set status to pending
    status.value = 'pending'

    const promise = new Promise<ResT>((resolve, reject) => {
      try {
        resolve(handler())
      } catch (err) {
        reject(err)
      }
    })
      .then(async (_result) => {
        // If this request is cancelled, stop processing
        if (canceled) return

        let result = _result as unknown as DataT

        // Apply transform function if provided
        if (_options.transform) {
          result = await _options.transform(_result)
        }

        // Update state
        data.value = result as DataT | DefaultT
        error.value = undefined
        status.value = 'success'
      })
      .catch((err: Error) => {
        // If this request is cancelled, stop processing
        if (canceled) return

        // Update state
        error.value = err
        status.value = 'error'

        throw err
      })
      .finally(() => {
        // If this request is cancelled, stop processing
        if (canceled) return

        // Remove from promises map
        asyncPromises.delete(_key.value)

        // Reset canceled flag
        canceled = false
      })

    // Store promise for deduplication
    asyncPromises.set(_key.value, promise)

    // Wait for the promise to resolve but return void
    await promise.catch(() => {}) // Catch errors here to prevent unhandled rejections
    return
  }

  // Create a debounced version for the execute function
  const execute = debounce(_execute, 0, { leading: true })

  // Clear function to reset state
  const clear = () => {
    data.value = _options.default() as DataT | DefaultT
    error.value = undefined
    status.value = 'idle'
    canceled = true
    asyncPromises.delete(_key.value)
    canceled = false
  }

  // Set up watchers if provided
  if (_options.watch) {
    const sources = Array.isArray(_options.watch) ? _options.watch : [_options.watch]

    const stopWatch = watch(
      sources,
      () => {
        execute({ cause: 'watch' })
      },
      { deep: true },
    )

    // Clean up watcher on component unmount
    onUnmounted(stopWatch)
  }

  // Execute immediately if option is set
  if (_options.immediate) {
    execute({ cause: 'immediate' })
  }

  // Return the async data object
  return {
    data,
    pending,
    error,
    status,
    refresh: execute,
    execute,
    clear,
  }
}

/**
 * Lazy version of useAsync that doesn't execute immediately
 */
export function useLazyAsync<ResT, DataT = ResT, DefaultT = undefined>(
  key: MaybeRefOrGetter<string>,
  handler: () => Promise<ResT>,
  options: Omit<UseAsyncOptions<ResT, DataT, DefaultT>, 'immediate'> = {},
): AsyncData<DataT | DefaultT, Error> {
  return useAsync(key, handler, { ...options, immediate: false })
}
