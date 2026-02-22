import { useTranslation } from "@/contexts/LanguageContext";
import { Notification } from "@/services/notificationsService";
import { useAppDispatch, useAppSelector } from "@/store";
import {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    selectNotifications,
} from "@/store/slices/notificationsSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationType = "info" | "success" | "warning" | "class";

function formatTimeAgo(dateString: string): string {
    const now = Date.now();
    const diff = now - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

function getNotificationType(type: string): NotificationType {
    if (type.includes("class") || type.includes("calendar")) return "class";
    if (type.includes("success") || type.includes("complete")) return "success";
    if (type.includes("warning") || type.includes("alert")) return "warning";
    return "info";
}

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case "class":
            return { name: "calendar", color: "#00aeed", bg: "#e6f7fd" };
        case "success":
            return {
                name: "checkmark-circle",
                color: "#10b981",
                bg: "#dcfce7",
            };
        case "warning":
            return { name: "alert-circle", color: "#f59e0b", bg: "#fef3c7" };
        case "info":
        default:
            return {
                name: "information-circle",
                color: "#6366f1",
                bg: "#e0e7ff",
            };
    }
}

function NotificationCard({
    item,
    onPress,
}: {
    item: Notification;
    onPress: (id: number) => void;
}) {
    const notificationType = getNotificationType(item.type);
    const icon = getNotificationIcon(notificationType);

    return (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                item.read_at === null && styles.unreadCard,
            ]}
            activeOpacity={0.7}
            onPress={() => onPress(item.id)}
        >
            <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                <Ionicons
                    name={icon.name as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={icon.color}
                />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text
                        style={[
                            styles.title,
                            item.read_at === null && styles.unreadTitle,
                        ]}
                    >
                        {item.title}
                    </Text>
                    {item.read_at === null && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={styles.time}>
                    {formatTimeAgo(item.created_at)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default function NotificationsScreen() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { notifications, unreadCount, isLoading } =
        useAppSelector(selectNotifications);
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const loadNotifications = useCallback(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleNotificationPress = useCallback(
        (notificationId: number) => {
            dispatch(markNotificationAsRead(notificationId));
        },
        [dispatch],
    );

    const handleReadAll = useCallback(() => {
        if (unreadCount > 0) {
            dispatch(markAllNotificationsAsRead());
        }
    }, [dispatch, unreadCount]);

    if (isLoading && notifications.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {t("notifications.title")}
                    </Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00aeed" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft} />
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>
                        {t("notifications.title")}
                    </Text>
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                {unreadCount > 0 ? (
                    <TouchableOpacity
                        style={styles.readAllButton}
                        onPress={handleReadAll}
                    >
                        <Text style={styles.readAllText}>
                            {t("notifications.markAllRead")}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerLeft} />
                )}
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <NotificationCard
                        item={item}
                        onPress={handleNotificationPress}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    isTablet && {
                        maxWidth: 600,
                        alignSelf: "center",
                        width: "100%",
                    },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={loadNotifications}
                        colors={["#00aeed"]}
                        tintColor="#00aeed"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="notifications-off-outline"
                            size={48}
                            color="#9ca3af"
                        />
                        <Text style={styles.emptyText}>
                            {t("notifications.noNotifications")}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#ffffff",
    },
    headerLeft: {
        width: 70,
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
    readAllButton: {
        width: 70,
        alignItems: "flex-end",
    },
    readAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#00aeed",
    },
    badge: {
        backgroundColor: "#dc2626",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: "center",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ffffff",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        gap: 12,
    },
    notificationCard: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        gap: 12,
    },
    unreadCard: {
        backgroundColor: "#f0f9ff",
        borderColor: "#bae6fd",
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
        gap: 4,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: "500",
        color: "#374151",
    },
    unreadTitle: {
        fontWeight: "600",
        color: "#111827",
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#00aeed",
    },
    message: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: "#9ca3af",
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: "#6b7280",
    },
});
