import React, { createContext, useContext, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Context - Push notifications are disabled
// ---------------------------------------------------------------------------
type NotificationContextType = {
    expoPushToken: string | null;
    registerForPushNotifications: () => Promise<void>;
    notification: null;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

// ---------------------------------------------------------------------------
// Provider - Push notifications disabled
// ---------------------------------------------------------------------------
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
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

