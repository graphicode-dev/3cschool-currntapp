import { ApiError } from "@/services/api";
import {
    Notification,
    notificationsService,
} from "@/services/notificationsService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

export const fetchNotifications = createAsyncThunk<
    Notification[],
    void,
    { rejectValue: string }
>("notifications/fetchNotifications", async (_, { rejectWithValue }) => {
    try {
        const response = await notificationsService.getNotifications();
        if (response.code === 200) {
            return response.data;
        }
        return rejectWithValue("Failed to fetch notifications");
    } catch (error) {
        const apiError = error as ApiError;
        return rejectWithValue(apiError.message || "An error occurred");
    }
});

export const fetchUnreadCount = createAsyncThunk<
    number,
    void,
    { rejectValue: string }
>("notifications/fetchUnreadCount", async (_, { rejectWithValue }) => {
    try {
        const response = await notificationsService.getUnreadCount();
        if (response.code === 200) {
            // Handle various API response formats
            const data = response.data;
            if (typeof data === "number") {
                return data;
            }
            // Try different possible field names
            return data?.count ?? data?.unread_count ?? 0;
        }
        return rejectWithValue("Failed to fetch unread count");
    } catch (error) {
        const apiError = error as ApiError;
        return rejectWithValue(apiError.message || "An error occurred");
    }
});

export const markNotificationAsRead = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>(
    "notifications/markAsRead",
    async (notificationId: number, { rejectWithValue }) => {
        try {
            const response =
                await notificationsService.markAsRead(notificationId);
            if (response.code === 200) {
                return notificationId;
            }
            return rejectWithValue("Failed to mark notification as read");
        } catch (error) {
            const apiError = error as ApiError;
            return rejectWithValue(apiError.message || "An error occurred");
        }
    },
);

export const markAllNotificationsAsRead = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>("notifications/markAllAsRead", async (_, { rejectWithValue }) => {
    try {
        const response = await notificationsService.markAllAsRead();
        if (response.code === 200) {
            return;
        }
        return rejectWithValue("Failed to mark all notifications as read");
    } catch (error) {
        const apiError = error as ApiError;
        return rejectWithValue(apiError.message || "An error occurred");
    }
});

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearNotificationsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Notifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload;
                state.unreadCount = action.payload.filter(
                    (n) => n.read_at === null,
                ).length;
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch notifications";
            });

        // Fetch Unread Count
        builder
            .addCase(fetchUnreadCount.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(fetchUnreadCount.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch unread count";
            });

        // Mark as Read
        builder
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(
                    (n) => n.id === action.payload,
                );
                if (notification && notification.read_at === null) {
                    notification.read_at = new Date().toISOString();
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.error =
                    action.payload || "Failed to mark notification as read";
            });

        // Mark All as Read
        builder
            .addCase(markAllNotificationsAsRead.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.isLoading = false;
                const now = new Date().toISOString();
                state.notifications.forEach((n) => {
                    if (n.read_at === null) {
                        n.read_at = now;
                    }
                });
                state.unreadCount = 0;
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to mark all as read";
            });
    },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export const selectNotifications = (state: RootState) => state.notifications;
export default notificationsSlice.reducer;
