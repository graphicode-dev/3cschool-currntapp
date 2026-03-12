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

import {
    useInfiniteQuery,
    useQuery,
    type UseInfiniteQueryOptions,
    type UseQueryOptions,
} from "@tanstack/react-query";
import { notificationsApi } from "./notifications.api";
import { notificationsKeys } from "./notifications.keys";
import type { UnreadCountResponse } from "./notifications.types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch paginated list of notifications with infinite scroll
 *
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useNotificationsList();
 * const notifications = data?.pages.flatMap(page => page.data) ?? [];
 * ```
 */
export function useNotificationsList(
    options?: Partial<UseInfiniteQueryOptions<any, Error>>,
) {
    return useInfiniteQuery({
        queryKey: notificationsKeys.list(),
        queryFn: async ({ pageParam = 1, signal }) => {
            const response = await notificationsApi.getNotifications(
                pageParam as number,
                20,
                signal,
            );
            if (response.error) {
                throw response.error;
            }
            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (
                lastPage.pagination.current_page < lastPage.pagination.last_page
            ) {
                return lastPage.pagination.current_page + 1;
            }
            return undefined;
        },
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
        ...options,
    });
}
