import { Icons } from "@/constants/icons";
import { Palette, Radii, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { Notification } from "@/services/notifications";
import { useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { ThemedText } from "../themed-text";

export function NotificationCard({
    item,
    onRead,
    onDelete,
    onNavigate,
}: {
    item: Notification;
    onRead: (id: number) => void;
    onDelete: (id: number) => void;
    onNavigate: (item: Notification) => void;
}) {
    const { isRTL } = useLanguage();
    const swipeableRef = useRef<Swipeable>(null);

    const renderDeleteAction = (
        _progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const inputRange = isRTL ? [0, 80] : [-80, 0];
        const outputRange = isRTL ? [0.5, 1] : [1, 0.5];

        const scale = dragX.interpolate({
            inputRange,
            outputRange,
            extrapolate: "clamp",
        });

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    swipeableRef.current?.close();
                    onDelete(item.id);
                }}
                style={styles.swipeContainer}
            >
                <Animated.View
                    style={[styles.deleteButton, { transform: [{ scale }] }]}
                >
                    <Icons.TrashIcon size={20} color="#393838" />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            friction={2}
            overshootFriction={8}
            leftThreshold={isRTL ? 40 : undefined}
            rightThreshold={isRTL ? undefined : 40}
            renderLeftActions={isRTL ? renderDeleteAction : undefined}
            renderRightActions={isRTL ? undefined : renderDeleteAction}
        >
            <View style={styles.notificationCard}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        if (!item.read_at) onRead(item.id);
                        onNavigate(item);
                    }}
                    style={styles.cardContent}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleRow}>
                            <Icons.BellIcon size={30} color={Palette.brand[500]} />
                            <ThemedText style={styles.cardTitle}>
                                {item.title}
                            </ThemedText>
                        </View>
                        {!item.read_at && <View style={styles.unreadDot} />}
                    </View>
                    <ThemedText style={styles.cardBody}>{item.message}</ThemedText>
                </TouchableOpacity>

                {!item.read_at && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(item.id)}
                        activeOpacity={0.8}
                    >
                        <Icons.TrashIcon size={20} color="#393838" />
                    </TouchableOpacity>
                )}
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    cardContent: {
        flex: 1,
        backgroundColor: "#E9F7FC",
        borderWidth: 0.8,
        borderColor: Palette.brand[500],
        borderRadius: Radii.xl,
        padding: Spacing.lg,
        minHeight: 98,
        justifyContent: "center",
        opacity: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.sm,
    },
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        flex: 1,
    },
    cardTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semiBold,
        color: Palette.brand[500],
        letterSpacing: -0.154,
        textTransform: "capitalize",
    },
    unreadDot: {
        width: 9.69,
        height: 9.69,
        borderRadius: 4.845,
        backgroundColor: Palette.brand[500],
    },
    cardBody: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.regular,
        color: "#A4A3A3",
        letterSpacing: -0.132,
        lineHeight: 18,
        textTransform: "capitalize",
        paddingLeft: 28,
    },
    deleteButton: {
        backgroundColor: "#E9F7FC",
        borderWidth: 1,
        borderColor: Palette.brand[500],
        borderRadius: 36,
        width: 35,
        height: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8.8,
        elevation: 2,
    },
    swipeContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: 60,
    },
});