import { notificationsService } from "@/services/notificationsService";
import { useAppSelector } from "@/store";
import { selectAuth } from "@/store/slices/authSlice";
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
    const { user } = useAppSelector(selectAuth);
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
        useState<Notifications.Notification | null>(null);

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
        // console.log("token", token);

        // Send the token to your backend for notification delivery
        await notificationsService.savePushToken(token);
    };

    const handleNotification = (
        receivedNotification: Notifications.Notification | null,
    ) => {
        if (receivedNotification) {
            setNotification(receivedNotification);

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
