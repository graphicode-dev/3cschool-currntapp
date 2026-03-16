import CustomHeader from "@/components/custom-header";
import { NotificationCard } from "@/components/notifocations/NotificationCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Palette, Radii, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import {
    Notification,
    useMarkAsRead,
    useNotificationsList,
} from "@/services/notifications";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Fetch notifications from API with infinite scroll
    const {
        data: notificationsData,
        isLoading,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useNotificationsList();

    // Flatten all pages to get all notifications
    const notifications = React.useMemo(() => {
        return notificationsData?.pages.flatMap((page: any) => page.data) ?? [];
    }, [notificationsData]);

    // Get total count from first page
    const totalCount = notificationsData?.pages[0]?.pagination?.total ?? 0;

    // Debug: Log the notifications data
    // React.useEffect(() => {
    //     console.log("Notifications data:", notificationsData);
    //     console.log("Flattened notifications:", notifications);
    //     console.log("Loading:", isLoading);
    //     console.log("Error:", error);
    //     console.log("Has next page:", hasNextPage);
    // }, [notificationsData, notifications, isLoading, error, hasNextPage]);

    // Mark as read mutation
    const { mutateAsync: markAsRead } = useMarkAsRead();

    const handleRead = useCallback(
        async (id: number) => {
            try {
                await markAsRead(id);
            } catch {
                // Error handling: Failed to mark notification as read
            }
        },
        [markAsRead],
    );

    // Simple UI-only delete for demo purposes
    const handleDelete = useCallback((id: number) => {
        // In a real implementation, this would call a delete API
        // console.log("Delete notification:", id);
    }, []);

    // Drop-in replacement for handleNavigate in NotificationsScreen
    const handleNavigate = useCallback(
        (item: Notification) => {
            // Handle chat_message and broadcast_message types - go to group chat
            if (
                (item.type === "chat_message" ||
                    item.type === "broadcast_message" ||
                    item.type === "group_chat_message") &&
                item.data?.group_id
            ) {
                router.push({
                    pathname: "/(app)/(tabs)/chats/[id]",
                    params: {
                        id: item.data.group_id,
                        groupId: item.data.group_id,
                        groupName: item.data.group_name || "Chat",
                    },
                } as any);
                return;
            }

            // Handle ticket_reply types - go to ticket detail
            if (item.type === "ticket_reply" && item.data?.ticket_id) {
                router.push({
                    pathname: "/(app)/(tabs)/support/[id]",
                    params: {
                        id: item.data.ticket_id,
                    },
                } as any);
                return;
            }

            // Handle push notifications - no navigation (general notifications)
            if (item.type === "push") {
                // No navigation for push notifications, just mark as read
                return;
            }

            // Handle legacy notifications with navigateTo property
            if (!item.data?.navigateTo) return;

            const params =
                (item.data.navigateParams as Record<string, unknown>) ?? {};

            switch (item.data.navigateTo) {
                case "ticket_detail":
                    router.push({
                        pathname: "/(app)/(tabs)/support",
                        params,
                    } as any);
                    break;
                case "conversation_detail":
                    if (params.conversationId) {
                        router.push(
                            `/(app)/(tabs)/chat/${params.conversationId}` as any,
                        );
                    }
                    break;
                default:
                    break;
            }
        },
        [router],
    );

    const renderItem = ({ item }: { item: Notification }) => (
        <NotificationCard
            item={item}
            onRead={handleRead}
            onDelete={handleDelete}
            onNavigate={handleNavigate}
        />
    );

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Render footer for loading indicator
    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={Palette.brand[500]} />
                <ThemedText
                    style={styles.loadingText}
                    fontSize={Typography.sizes.base}
                >
                    Loading more...
                </ThemedText>
            </View>
        );
    }, [isFetchingNextPage]);

    if (isLoading && notifications.length === 0) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={Palette.brand[500]}
                    />
                    <ThemedText
                        style={styles.loadingText}
                        fontSize={Typography.sizes.base}
                    >
                        {t("notifications.loading")}
                    </ThemedText>
                </View>
            </View>
        );
    }

    if (error && notifications.length === 0) {
        return (
            <ScreenWrapper>
                <CustomHeader title="notifications" />
                <View style={styles.errorContainer}>
                    <ThemedText
                        style={styles.errorText}
                        fontSize={Typography.sizes.base}
                    >
                        Error loading notifications
                    </ThemedText>
                    <ThemedText
                        style={styles.errorDetail}
                        fontSize={Typography.sizes.sm}
                    >
                        {error?.message || "Unknown error occurred"}
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetch()}
                    >
                        <ThemedText
                            style={styles.retryButtonText}
                            fontSize={Typography.sizes.base}
                        >
                            Retry
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            {/* Header */}
            <CustomHeader title="Notifications" />

            {/* All Notifications Section */}
            <View style={styles.allNotificationsSection}>
                <View style={styles.sectionHeader}>
                    <ThemedText
                        style={styles.sectionTitle}
                        fontSize={Typography.sizes.xl}
                    >
                        all notifications
                    </ThemedText>
                    <View style={styles.notificationBadge}>
                        <ThemedText
                            style={styles.badgeText}
                            fontSize={Typography.sizes.sm}
                        >
                            {totalCount}
                        </ThemedText>
                    </View>
                </View>

                {/* Notification list */}
                {notifications.length === 0 && !isLoading ? (
                    <View style={styles.emptyContainer}>
                        <ThemedText
                            style={styles.emptyText}
                            fontSize={Typography.sizes.xl}
                        >
                            No notifications yet
                        </ThemedText>
                        <ThemedText
                            style={styles.emptySubText}
                            fontSize={Typography.sizes.md}
                        >
                            You&apos;ll see your notifications here
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: Spacing.lg }} />
                        )}
                        onRefresh={handleRefresh}
                        refreshing={isRefreshing}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={renderFooter}
                        ListFooterComponentStyle={styles.footerContainer}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: Spacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: "#E9F7FC",
        width: "100%",
    },
    allNotificationsSection: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontWeight: Typography.weights.semiBold,
        color: "#393838",
        textTransform: "capitalize",
    },
    notificationBadge: {
        backgroundColor: "#E9F7FC",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 52,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        fontWeight: Typography.weights.semiBold,
        color: Palette.brand[500],
    },
    listContent: {
        paddingBottom: 120,
    },

    bottomNavigation: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 67,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        borderWidth: 1,
        borderColor: "#BBE6F6",
        borderTopLeftRadius: Radii.xl,
        borderTopRightRadius: Radii.xl,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: Spacing.xl,
        backdropFilter: "blur(15.9px)",
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
    },
    navItemActive: {
        backgroundColor: "#50BDE9",
        width: 69,
        height: 67,
        borderRadius: Radii.xl,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.md,
    },
    loadingText: {
        color: Palette.brand[300],
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
    },
    errorText: {
        color: Palette.brand[300],
        textAlign: "center",
        marginBottom: Spacing.sm,
    },
    errorDetail: {
        color: Palette.brand[200],
        textAlign: "center",
        marginBottom: Spacing.lg,
    },
    retryButton: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Palette.brand[500],
        borderRadius: Radii.md,
    },
    retryButtonText: {
        color: Palette.white,
        fontWeight: Typography.weights.medium,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing["3xl"],
    },
    emptyText: {
        color: Palette.brand[300],
        textAlign: "center",
        marginBottom: Spacing.sm,
    },
    emptySubText: {
        color: Palette.brand[200],
        textAlign: "center",
    },
    loadingFooter: {
        paddingVertical: Spacing.lg,
        alignItems: "center",
        gap: Spacing.sm,
    },
    footerContainer: {
        paddingBottom: Spacing.xl,
    },
});
