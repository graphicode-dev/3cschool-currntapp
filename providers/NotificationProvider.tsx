
/* eslint-disable react-hooks/exhaustive-deps */
import useNotificationHandler from "@/hooks/useNotificationHandler";
import { useAuthStore } from "@/services/auth/auth.store";
import { notificationsApi } from "@/services/notifications/notifications.api";
import { notificationsKeys } from "@/services/notifications/notifications.keys";
import { useQueryClient } from "@tanstack/react-query";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import React, {
    Component,
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// Detect Expo Go reliably — Constants.appOwnership is deprecated in SDK 53+
// ---------------------------------------------------------------------------
const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
type NotificationContextType = {
    expoPushToken: string | null;
    registerForPushNotifications: () => Promise<void>;
    notification: Notifications.Notification | null;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

// ---------------------------------------------------------------------------
// Error Boundary — prevents a push-notification crash from breaking the
// QueryClientProvider above it and causing "No QueryClient set" on every screen
// ---------------------------------------------------------------------------
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class NotificationErrorBoundary extends Component<
    { children: ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error) {
        console.warn(
            "[NotificationProvider] Caught error, notifications disabled:",
            error.message,
        );
    }

    render() {
        if (this.state.hasError) {
            // Render children without notification context — app still works
            return <>{this.props.children}</>;
        }
        return this.props.children;
    }
}

// ---------------------------------------------------------------------------
// Inner provider — only mounts when push notifications are actually supported
// ---------------------------------------------------------------------------
const NotificationProviderInner: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { user, isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
        useState<Notifications.Notification | null>(null);

    console.log("[Received Notification]:", notification);

    useNotificationHandler(notification);

    const registerForPushNotifications = async () => {
        if (!user) return;

        try {
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } =
                    await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                console.warn("[NotificationProvider] Permission denied.");
                return;
            }

            const { data: token } = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            // console.log("[NotificationProvider] Expo Token:", token);
            setExpoPushToken(token);

            await notificationsApi.savePushToken(token);
        } catch (error) {
            console.error(
                "[NotificationProvider] Failed to register push token:",
                error,
            );
        }
    };

    const handleNotification = (
        receivedNotification: Notifications.Notification | null,
    ) => {
        if (!receivedNotification) return;
        setNotification(receivedNotification);

        // Refresh notifications list and unread count when notification is received
        queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
        queryClient.invalidateQueries({
            queryKey: notificationsKeys.unreadCount(),
        });

        setTimeout(() => setNotification(null), 100);
    };

    useEffect(() => {
        if (!user || !isAuthenticated) return;

        const listener =
            Notifications.addNotificationReceivedListener(handleNotification);

        registerForPushNotifications().catch((e) =>
            console.error("[NotificationProvider] Registration failed:", e),
        );

        return () => listener.remove();
    }, [user, isAuthenticated]);

    return (
        <NotificationContext.Provider
            value={{
                expoPushToken,
                registerForPushNotifications,
                notification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

// ---------------------------------------------------------------------------
// Public provider — skips push setup entirely on Expo Go Android
// ---------------------------------------------------------------------------
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    // Expo Go on Android: SDK 53+ removed push notification support entirely.
    // Rendering the inner provider would crash the module at import time and
    // corrupt the React tree, causing "No QueryClient set" on every screen.
    if (isExpoGo && Platform.OS === "android") {
        // console.log(
        //     "[NotificationProvider] Expo Go on Android — push notifications disabled.",
        // );
        return (
            <NotificationContext.Provider
                value={{
                    expoPushToken: null,
                    registerForPushNotifications: async () => {},
                    notification: null,
                }}
            >
                {children}
            </NotificationContext.Provider>
        );
    }

    return (
        <NotificationErrorBoundary>
            <NotificationProviderInner>{children}</NotificationProviderInner>
        </NotificationErrorBoundary>
    );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotification must be used within a NotificationProvider",
        );
    }
    return context;
};
