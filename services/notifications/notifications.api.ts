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
     * Get list of all notifications with pagination
     */
    getNotifications: async (
        page: number = 1,
        limit: number = 20,
        signal?: AbortSignal,
    ): Promise<
        ApiResponse<{
            data: Notification[];
            pagination: {
                current_page: number;
                last_page: number;
                per_page: number;
                total: number;
            };
        }>
    > => {
        console.log("Making API call to /notifications with page:", page);
        const response = await api.get<{
            code: number;
            message: string;
            data: Notification[];
            pagination: {
                current_page: number;
                last_page: number;
                per_page: number;
                total: number;
            };
        }>("/notifications", {
            params: { page, limit },
            signal,
        });
        console.log("API response:", response);

        // Extract the notifications array from the wrapped response
        if (response.data && response.data.data) {
            return {
                success: true,
                message:
                    response.data.message ||
                    "Notifications retrieved successfully",
                data: {
                    data: response.data.data,
                    pagination: response.data.pagination,
                },
                error: null,
            };
        }

        return {
            success: false,
            message: "No notifications data found",
            data: {
                data: [],
                pagination: {
                    current_page: 1,
                    last_page: 1,
                    per_page: limit,
                    total: 0,
                },
            },
            error: null,
        };
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
