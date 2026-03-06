/**
 * Speakers Feature - Query Keys
 *
 * Stable query key factory for TanStack Query.
 * Keys are hierarchical for easy invalidation.
 *
 * @example
 * ```ts
 * // Invalidate all speakers data
 * queryClient.invalidateQueries({ queryKey: speakersKeys.all });
 *
 * // Invalidate just the list
 * queryClient.invalidateQueries({ queryKey: speakersKeys.lists() });
 * ```
 */

import type { ListQueryParams } from "@/services/api";

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Query key factory for speakers
 *
 * Hierarchy:
 * - all: ['speakers']
 * - lists: ['speakers', 'list']
 * - list: ['speakers', 'list', params]
 * - details: ['speakers', 'detail']
 * - detail: ['speakers', 'detail', id]
 * - metadata: ['speakers', 'metadata']
 */
export const speakersKeys = {
    /**
     * Root key for all speakers queries
     */
    all: ["speakers"] as const,

    /**
     * Key for all list queries
     */
    lists: () => [...speakersKeys.all, "list"] as const,

    /**
     * Key for a specific list query with params
     */
    list: (params?: ListQueryParams) =>
        [...speakersKeys.lists(), params ?? {}] as const,

    /**
     * Key for all detail queries
     */
    details: () => [...speakersKeys.all, "detail"] as const,

    /**
     * Key for a specific detail query
     */
    detail: (id: string | number) =>
        [...speakersKeys.details(), String(id)] as const,

    /**
     * Key for metadata query
     */
    metadata: () => [...speakersKeys.all, "metadata"] as const,
};

/**
 * Type for speakers query keys
 */
export type SpeakersQueryKey =
    | typeof speakersKeys.all
    | ReturnType<typeof speakersKeys.lists>
    | ReturnType<typeof speakersKeys.list>
    | ReturnType<typeof speakersKeys.details>
    | ReturnType<typeof speakersKeys.detail>
    | ReturnType<typeof speakersKeys.metadata>;
