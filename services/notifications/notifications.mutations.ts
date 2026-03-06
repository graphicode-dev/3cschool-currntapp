/**
 * Notifications Feature - Mutation Hooks
 *
 * TanStack Query mutation hooks for creating, updating, and deleting notifications.
 *
 * @example
 * ```tsx
 * // Create
 * const { mutateAsync: create } = useCreateNotification();
 * await create({ name: 'test', caption: 'Test', description: 'Test', is_active: 1 });
 *
 * // Update
 * const { mutateAsync: update } = useUpdateNotification();
 * await update({ id: '1', data: { name: 'updated' } });
 *
 * // Delete
 * const { mutateAsync: remove } = useDeleteNotification();
 * await remove('1');
 * ```
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./notifications.api";
import { notificationsKeys } from "./notifications.keys";

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to mark a notification as read
 *
 * @example
 * ```tsx
 * const { mutateAsync, isPending } = useMarkAsRead();
 *
 * const handleMarkRead = async (notificationId: number) => {
 *     await mutateAsync(notificationId);
 * };
 * ```
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: number) => {
            const response = await notificationsApi.markAsRead(notificationId);
            if (response.error) {
                throw response.error;
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: notificationsKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: notificationsKeys.unreadCount(),
            });
        },
    });
}

/**
 * Hook to mark all notifications as read
 *
 * @example
 * ```tsx
 * const { mutateAsync, isPending } = useMarkAllAsRead();
 *
 * const handleMarkAllRead = async () => {
 *     await mutateAsync();
 * };
 * ```
 */
export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await notificationsApi.markAllAsRead();
            if (response.error) {
                throw response.error;
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: notificationsKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: notificationsKeys.unreadCount(),
            });
        },
    });
}

/**
 * Hook to save push token
 *
 * @example
 * ```tsx
 * const { mutateAsync, isPending } = useSavePushToken();
 *
 * const handleSaveToken = async (token: string) => {
 *     await mutateAsync(token);
 * };
 * ```
 */
export function useSavePushToken() {
    return useMutation({
        mutationFn: async (token: string) => {
            const response = await notificationsApi.savePushToken(token);
            if (response.error) {
                throw response.error;
            }
            return response.data;
        },
    });
}
