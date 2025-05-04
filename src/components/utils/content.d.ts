import type { ContentNavigationItem, ContentCollectionItem } from '@nuxt/content';
type MapContentNavigationItemOptions = {
    labelAttribute?: string;
};
export declare function mapContentNavigationItem(item: ContentNavigationItem, options?: MapContentNavigationItemOptions): Omit<ContentNavigationItem, "path" | "title"> & {
    label?: string;
    to?: string;
};
export declare function mapContentNavigation(navigation: ContentNavigationItem[], options?: MapContentNavigationItemOptions): (Omit<ContentNavigationItem, "path" | "title"> & {
    label?: string;
    to?: string;
})[];
export declare function findPageHeadline(navigation?: ContentNavigationItem[], page?: ContentCollectionItem | null): string | undefined;
export declare function findPageBreadcrumb(navigation?: ContentNavigationItem[], page?: ContentCollectionItem | undefined | null): ContentNavigationItem[];
export {};
