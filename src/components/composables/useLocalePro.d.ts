import type { Locale } from '@nuxt/ui';
import type { Ref } from 'vue';
import type { Messages } from '../types/locale';
export declare const useLocalePro: (localeOverrides?: Ref<Locale<Messages> | undefined>) => import("@nuxt/ui/runtime/utils/locale.js").LocaleContext<Messages>;
