import { computed, inject, toRef } from "vue";
import { createSharedComposable } from "@vueuse/core";
import { localeContextInjectionKey } from "@nuxt/ui/composables/useLocale.js";
import { buildLocaleContext } from "@nuxt/ui/utils/locale";
import en from "../locale/en.js";
const _useLocalePro = (localeOverrides) => {
  const locale = localeOverrides || toRef(inject(localeContextInjectionKey));
  return buildLocaleContext(computed(() => locale.value || en));
};
export const useLocalePro = /* @__PURE__ */ createSharedComposable(_useLocalePro);
