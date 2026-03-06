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

export interface PushTokenResponse {
    success: boolean;
}

export interface MarkReadResponse {
    success: boolean;
}
