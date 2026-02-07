import { useAppDispatch, useAppSelector } from "@/store";
import { restoreAuth, selectAuth } from "@/store/slices/authSlice";
import {
    fetchNotifications,
    fetchUnreadCount,
} from "@/store/slices/notificationsSlice";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isAuthenticated, isLoading } = useAppSelector(selectAuth);
    const segments = useSegments();
    const router = useRouter();
    const [isRestoring, setIsRestoring] = useState(true);

    // Restore auth state on mount
    useEffect(() => {
        const restore = async () => {
            await dispatch(restoreAuth());
            setIsRestoring(false);
        };
        restore();
    }, [dispatch]);

    // Fetch notifications when authenticated (this also updates unread count)
    useEffect(() => {
        if (!isRestoring && isAuthenticated) {
            // Fetch both - notifications list calculates count, unread-count is a backup
            dispatch(fetchNotifications());
            dispatch(fetchUnreadCount());
        }
    }, [isRestoring, isAuthenticated, dispatch]);

    // Handle navigation based on auth state
    useEffect(() => {
        if (isRestoring || isLoading) return;

        const inAuthGroup = segments[0] === "login";

        if (isAuthenticated && inAuthGroup) {
            // User is authenticated but on login screen, redirect to welcome screen
            router.replace("/welcome");
        } else if (!isAuthenticated && !inAuthGroup) {
            // User is not authenticated and not on login screen, redirect to login
            router.replace("/login");
        }
    }, [isAuthenticated, segments, isRestoring, isLoading, router]);

    // Show loading screen while restoring auth
    if (isRestoring) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f9fafb",
                }}
            >
                <ActivityIndicator size="large" color="#00aeed" />
            </View>
        );
    }

    return <>{children}</>;
}
