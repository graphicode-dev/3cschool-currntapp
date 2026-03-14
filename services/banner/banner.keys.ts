/**
 * Banners Feature - Query Keys
 *
 * Stable query key factory for TanStack Query.
 */

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Query key factory for banners
 */
export const bannersKeys = {
    /**
     * Root key for all banners queries
     */
    all: ["banners"] as const,

    /**
     * Key for banners list query
     */
    list: () => [...bannersKeys.all, "list"] as const,
};

/**
 * Type for banners query keys
 */
export type BannersQueryKey =
    | typeof bannersKeys.all
    | ReturnType<typeof bannersKeys.list>;
