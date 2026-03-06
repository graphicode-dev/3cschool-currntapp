/**
 * Notifications Feature - Query Keys
 *
 * Stable query key factory for TanStack Query.
 * Keys are hierarchical for easy invalidation.
 *
 * @example
 * ```ts
 * // Invalidate all notifications data
 * queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
 *
 * // Invalidate just the list
 * queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
 * ```
 */

/**
 * Query key factory for notifications
 *
 * Hierarchy:
 * - all: ['notifications']
 * - lists: ['notifications', 'list']
 * - list: ['notifications', 'list']
 * - details: ['notifications', 'detail']
 * - detail: ['notifications', 'detail', id]
 * - unreadCount: ['notifications', 'unread-count']
 */
export const notificationsKeys = {
    /**
     * Root key for all notifications queries
     */
    all: ["notifications"] as const,

    /**
     * Key for all list queries
     */
    lists: () => [...notificationsKeys.all, "list"] as const,

    /**
     * Key for a specific list query
     */
    list: () => [...notificationsKeys.lists()] as const,

    /**
     * Key for all detail queries
     */
    details: () => [...notificationsKeys.all, "detail"] as const,

    /**
     * Key for a specific detail query
     */
    detail: (id: string | number) =>
        [...notificationsKeys.details(), String(id)] as const,

    /**
     * Key for unread count query
     */
    unreadCount: () => [...notificationsKeys.all, "unread-count"] as const,
};

/**
 * Type for notifications query keys
 */
export type NotificationsQueryKey =
    | typeof notificationsKeys.all
    | ReturnType<typeof notificationsKeys.lists>
    | ReturnType<typeof notificationsKeys.list>
    | ReturnType<typeof notificationsKeys.details>
    | ReturnType<typeof notificationsKeys.detail>
    | ReturnType<typeof notificationsKeys.unreadCount>;
