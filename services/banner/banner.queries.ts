/**
 * Banners Feature - Query Hooks
 *
 * TanStack Query hooks for reading banners data.
 *
 * @example
 * ```tsx
 * // Get banners list
 * const { data } = useBannersList();
 * ```
 */

import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { Banner } from ".";
import { bannersApi } from "./banner.api";
import { bannersKeys } from "./banner.keys";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch list of banners
 *
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data } = useBannersList();
 * const banners = data ?? [];
 * ```
 */
export function useBannersList(
    options?: Partial<UseQueryOptions<Banner[], Error>>,
) {
    return useQuery({
        queryKey: bannersKeys.list(),
        queryFn: () => bannersApi.getList(),
        ...options,
    });
}
