/**
 * Tickets Feature - Query Keys
 *
 * Stable query key factory for TanStack Query.
 * Keys are hierarchical for easy invalidation.
 *
 * @example
 * ```ts
 * // Invalidate all tickets data
 * queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
 *
 * // Invalidate just the list
 * queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
 * ```
 */

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Query key factory for tickets
 *
 * Hierarchy:
 * - all: ['tickets']
 * - lists: ['tickets', 'list']
 * - list: ['tickets', 'list', params]
 * - details: ['tickets', 'detail']
 * - detail: ['tickets', 'detail', id]
 */
export const ticketsKeys = {
    /**
     * Root key for all tickets queries
     */
    all: ["tickets"] as const,

    /**
     * Key for all list queries
     */
    lists: () => [...ticketsKeys.all, "list"] as const,

    /**
     * Key for a specific list query with params
     */
    list: (params?: any) => [...ticketsKeys.lists(), params ?? {}] as const,

    /**
     * Key for all detail queries
     */
    details: () => [...ticketsKeys.all, "detail"] as const,

    /**
     * Key for a specific detail query
     */
    detail: (id: string | number) =>
        [...ticketsKeys.details(), String(id)] as const,
};

/**
 * Type for tickets query keys
 */
export type TicketsQueryKey =
    | typeof ticketsKeys.all
    | ReturnType<typeof ticketsKeys.lists>
    | ReturnType<typeof ticketsKeys.list>
    | ReturnType<typeof ticketsKeys.details>
    | ReturnType<typeof ticketsKeys.detail>;
