/**
 * Notifications Feature - API Module
 *
 * Public exports for the Notifications API layer.
 * Import from '@/features/dashboard/admin/notifications/api'.
 *
 * @example
 * ```ts
 * import {
 *     useNotificationsList,
 *     useNotification,
 *     notificationsKeys,
 * } from '@/features/dashboard/admin/notifications/api';
 * ```
 */

// Types
export type {
    MarkReadResponse,
    Notification,
    NotificationData,
    PushTokenResponse,
    UnreadCountResponse,
} from "./notifications.types";

// Query Keys
export {
    notificationsKeys,
    type NotificationsQueryKey,
} from "./notifications.keys";

// API Functions
export { notificationsApi } from "./notifications.api";

// Query Hooks
export { useNotificationsList, useUnreadCount } from "./notifications.queries";

// Mutations
export {
    useMarkAllAsRead,
    useMarkAsRead,
    useSavePushToken,
} from "./notifications.mutations";
