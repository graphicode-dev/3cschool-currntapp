/**
 * Banners Feature - API Module
 *
 * Public exports for the Banners API layer.
 * Import from '@/features/dashboard/admin/banners/api'.
 *
 * @example
 * ```ts
 * import {
 *     useBannersList,
 *     useBanner,
 *     bannersKeys,
 * } from '@/features/dashboard/admin/banners/api';
 * ```
 */

// Types
export type { Banner } from "./banner.types";

// Query Keys
export { bannersKeys, type BannersQueryKey } from "./banner.keys";

// API Functions
export { bannersApi } from "./banner.api";

// Query Hooks
export { useBannersList } from "./banner.queries";
