/**
 * Notifications Feature - API Functions
 *
 * Raw API functions for notifications domain.
 * These are pure functions that make HTTP requests.
 * They are used by query and mutation hooks.
 *
 * @example
 * ```ts
 * // In a query hook
 * const { data } = useQuery({
 *     queryKey: notificationsKeys.list(),
 *     queryFn: ({ signal }) => notificationsApi.getNotifications(signal),
 * });
 * ```
 */

import { api, ApiResponse } from "../api";
import type {
    MarkReadResponse,
    Notification,
    PushTokenResponse,
    UnreadCountResponse,
} from "./notifications.types";

/**
 * Notifications API functions
 */
export const notificationsApi = {
    /**
     * Get list of all notifications
     */
    getNotifications: async (
        signal?: AbortSignal,
    ): Promise<ApiResponse<Notification[]>> => {
        return api.get<Notification[]>("/notifications", { signal });
    },

    /**
     * Get unread count
     */
    getUnreadCount: async (
        signal?: AbortSignal,
    ): Promise<ApiResponse<UnreadCountResponse>> => {
        return api.get<UnreadCountResponse>("/notifications/unread-count", {
            signal,
        });
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (
        notificationId: number,
        signal?: AbortSignal,
    ): Promise<ApiResponse<MarkReadResponse>> => {
        return api.post<MarkReadResponse>(
            `/notifications/${notificationId}/read`,
            {},
            { signal },
        );
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (
        signal?: AbortSignal,
    ): Promise<ApiResponse<MarkReadResponse>> => {
        return api.post<MarkReadResponse>(
            "/notifications/read-all",
            {},
            { signal },
        );
    },

    /**
     * Save push token
     */
    savePushToken: async (
        token: string,
        signal?: AbortSignal,
    ): Promise<ApiResponse<PushTokenResponse>> => {
        return api.post<PushTokenResponse>(
            "/expo-token",
            { token },
            { signal },
        );
    },
};

export default notificationsApi;
