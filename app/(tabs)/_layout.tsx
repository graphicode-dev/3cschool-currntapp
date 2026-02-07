import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { useAppDispatch, useAppSelector } from "@/store";
import {
    fetchUnreadCount,
    selectNotifications,
} from "@/store/slices/notificationsSlice";

export default function TabLayout() {
    const dispatch = useAppDispatch();
    const { unreadCount } = useAppSelector(selectNotifications);

    useEffect(() => {
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    return (
        <Tabs
            initialRouteName="chats"
            screenOptions={{
                tabBarActiveTintColor: "#00aeed",
                tabBarInactiveTintColor: "#9ca3af",
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    height: 78,
                    paddingTop: 8,
                    paddingBottom: 20,
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: "400",
                },
            }}
        >
            <Tabs.Screen
                name="chats"
                options={{
                    title: "Groups",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="people-outline"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="tickets"
                options={{
                    title: "Support",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="headset-outline"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Notifications",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="notifications-outline"
                            size={24}
                            color={color}
                        />
                    ),
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: "#dc2626",
                        fontSize: 10,
                        minWidth: 18,
                        height: 18,
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-outline"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
