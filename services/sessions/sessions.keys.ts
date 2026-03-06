/**
 * Sessions Feature - Query Keys
 *
 * Stable query key factory for TanStack Query.
 * Keys are hierarchical for easy invalidation.
 *
 * @example
 * ```ts
 * // Invalidate all sessions data
 * queryClient.invalidateQueries({ queryKey: sessionsKeys.all });
 *
 * // Invalidate just the all sessions list
 * queryClient.invalidateQueries({ queryKey: sessionsKeys.allSessions() });
 * ```
 */

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Query key factory for sessions
 *
 * Hierarchy:
 * - all: ['sessions']
 * - allSessions: ['sessions', 'all']
 * - groupSessions: ['sessions', 'group']
 * - groupSessionsList: ['sessions', 'group', groupId]
 */
export const sessionsKeys = {
    /**
     * Root key for all sessions queries
     */
    all: ["sessions"] as const,

    /**
     * Key for all sessions query
     */
    allSessions: () => [...sessionsKeys.all, "all"] as const,

    /**
     * Key for all group sessions queries
     */
    groupSessions: () => [...sessionsKeys.all, "group"] as const,

    /**
     * Key for a specific group's sessions
     */
    groupSessionsList: (groupId: string | number) =>
        [...sessionsKeys.groupSessions(), String(groupId)] as const,
};

/**
 * Type for sessions query keys
 */
export type SessionsQueryKey =
    | typeof sessionsKeys.all
    | ReturnType<typeof sessionsKeys.allSessions>
    | ReturnType<typeof sessionsKeys.groupSessions>
    | ReturnType<typeof sessionsKeys.groupSessionsList>;
