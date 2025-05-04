import { ref } from "vue";
import { createSharedComposable } from "@vueuse/core";
function _useContentSearch() {
  const open = ref(false);
  return {
    open
  };
}
export const useContentSearch = createSharedComposable(_useContentSearch);
