/**
 * Notifications Feature - Query Hooks
 *
 * TanStack Query hooks for reading notifications data.
 * All queries support AbortSignal for cancellation.
 *
 * @example
 * ```tsx
 * // Get notifications list
 * const { data: notifications } = useNotificationsList();
 *
 * // Get unread count
 * const { data: unreadCount } = useUnreadCount();
 *
 * // Get single notification
 * const { data: notification } = useNotification(id);
 * ```
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { notificationsApi } from "./notifications.api";
import { notificationsKeys } from "./notifications.keys";
import type { Notification, UnreadCountResponse } from "./notifications.types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch list of notifications
 *
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data } = useNotificationsList();
 * const notifications = data ?? [];
 * ```
 */
export function useNotificationsList(
    options?: Partial<UseQueryOptions<Notification[], Error>>,
) {
    return useQuery({
        queryKey: notificationsKeys.list(),
        queryFn: async ({ signal }) => {
            const response = await notificationsApi.getNotifications(signal);
            if (response.error) {
                throw response.error;
            }
            return response.data ?? [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
    });
}

/**
 * Hook to fetch unread count
 *
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data: unreadCount } = useUnreadCount();
 * const count = unreadCount?.count ?? 0;
 * ```
 */
export function useUnreadCount(
    options?: Partial<UseQueryOptions<UnreadCountResponse, Error>>,
) {
    return useQuery({
        queryKey: notificationsKeys.unreadCount(),
        queryFn: async ({ signal }) => {
            const response = await notificationsApi.getUnreadCount(signal);
            if (response.error) {
                throw response.error;
            }
            if (!response.data) {
                throw new Error("No data returned from server");
            }
            return response.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        ...options,
    });
}
