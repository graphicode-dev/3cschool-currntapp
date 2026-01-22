import { api, ApiResponse } from "./api";

export interface NotificationData {
    type: string;
    group_id?: string;
    sender_id?: number;
    [key: string]: unknown;
}

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    data: NotificationData | null;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UnreadCountResponse {
    count: number;
    unread_count?: number;
}

interface PushTokenResponse {
    success: boolean;
}

interface MarkReadResponse {
    success: boolean;
}

export const notificationsService = {
    async getNotifications(): Promise<ApiResponse<Notification[]>> {
        return api.get<Notification[]>("/notifications");
    },

    async getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
        return api.get<UnreadCountResponse>("/notifications/unread-count");
    },

    async markAsRead(
        notificationId: number,
    ): Promise<ApiResponse<MarkReadResponse>> {
        return api.post<MarkReadResponse>(
            `/notifications/${notificationId}/read`,
            {},
        );
    },

    async markAllAsRead(): Promise<ApiResponse<MarkReadResponse>> {
        return api.post<MarkReadResponse>("/notifications/read-all", {});
    },

    async savePushToken(
        token: string,
    ): Promise<ApiResponse<PushTokenResponse>> {
        return api.post<PushTokenResponse>("/expo-token", { token });
    },
};
