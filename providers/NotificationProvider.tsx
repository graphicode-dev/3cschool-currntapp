/* eslint-disable react-hooks/exhaustive-deps */
import Toast from "@/components/Toast";
import { notificationsService } from "@/services/notificationsService";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectAuth } from "@/store/slices/authSlice";
import { fetchUnreadCount } from "@/store/slices/notificationsSlice";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, useState } from "react";

type NotificationContextType = {
    expoPushToken: string | null;
    registerForPushNotifications: () => Promise<void>;
    notification: Notifications.Notification | null;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(selectAuth);
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
        useState<Notifications.Notification | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastData, setToastData] = useState<{
        title: string;
        message?: string;
    } | null>(null);

    // Register for push notifications
    const registerForPushNotifications = async () => {
        if (!user) return;

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            alert("Failed to get push token for push notifications!");
            return;
        }

        // ✅ Get Expo push token (works in production)
        const { data: token } = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        setExpoPushToken(token);
        console.log("token", token);

        // Send the token to your backend for notification delivery
        await notificationsService.savePushToken(token);
    };

    const handleNotification = (
        receivedNotification: Notifications.Notification | null,
    ) => {
        if (receivedNotification) {
            console.log(
                "receivedNotification",
                JSON.stringify(receivedNotification, null, 2),
            );
            setNotification(receivedNotification);

            // Refresh unread count when a push notification is received
            dispatch(fetchUnreadCount());

            // Show toast notification
            const title =
                receivedNotification.request.content.title ||
                "New Notification";
            const body = receivedNotification.request.content.body || undefined;
            setToastData({ title, message: body });
            setToastVisible(true);

            // Do NOT navigate here, only update state
            setTimeout(() => {
                setNotification(null);
            }, 100);
        }
    };

    useEffect(() => {
        registerForPushNotifications();

        const notificationListener =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log(
                    "notificationListener",
                    JSON.stringify(notification, null, 2),
                );
                handleNotification(notification);
            });

        return () => {
            // Using the recommended approach instead of the deprecated removeNotificationSubscription
            notificationListener.remove();
        };
    }, [user]);

    return (
        <NotificationContext.Provider
            value={{
                expoPushToken,
                registerForPushNotifications,
                notification,
            }}
        >
            {children}
            <Toast
                visible={toastVisible}
                title={toastData?.title || ""}
                message={toastData?.message}
                type="info"
                onDismiss={() => setToastVisible(false)}
            />
        </NotificationContext.Provider>
    );
};

// Custom hook to use the Notification context
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotification must be used within a NotificationProvider",
        );
    }
    return context;
};
