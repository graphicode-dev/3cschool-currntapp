import { ThemedText } from "@/components/themed-text";
import { MappedGroup } from "@/hooks/useGroupChats";
import { useUnreadMessages } from "@/services/groups/groups.queries";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface BasicChatListItemProps {
    chat: MappedGroup;
    isSelected: boolean;
    onClick: (group: MappedGroup) => void;
    onLongPress?: (id: string) => void;
}

export const ChatListItem = ({
    chat,
    isSelected,
    onClick,
    onLongPress,
}: BasicChatListItemProps) => {
    const { data: unreadData } = useUnreadMessages();

    // Get unread count for this specific chat
    const unreadCount =
        unreadData?.by_group?.find(
            (item: any) => item.course_group_id === chat.id,
        )?.count || 0;

    return (
        <TouchableOpacity
            onPress={() => onClick(chat)}
            onLongPress={() => onLongPress?.(chat.id.toString())}
            delayLongPress={500}
            style={[styles.item, isSelected && styles.itemSelected]}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <View style={styles.avatarWrap}>
                <Image
                    source={{
                        uri:
                            chat.avatar ||
                            "https://via.placeholder.com/48x48/1890FF/FFFFFF?text=" +
                                chat.name.charAt(0).toUpperCase(),
                    }}
                    style={styles.avatar}
                />
            </View>

            {/* ThemedText */}
            <View style={styles.info}>
                <ThemedText style={styles.name} numberOfLines={1}>
                    {chat.name}
                </ThemedText>
                <ThemedText style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                </ThemedText>
            </View>

            {/* Time + Unread */}
            <View style={styles.rightCol}>
                {/* <ThemedText style={styles.time}>{chat.time}</ThemedText> */}
                {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <ThemedText style={styles.unreadBadgeText}>
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </ThemedText>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E6F7FF",
    },
    itemSelected: {
        backgroundColor: "#E6F7FF",
    },
    avatarWrap: {
        position: "relative",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    dot: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    unreadDot: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#1890FF",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    unreadDotText: {
        fontSize: 9,
        color: "#FFFFFF",
        fontWeight: "700",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 3,
    },
    rightCol: {
        alignItems: "flex-end",
        gap: 4,
    },
    time: {
        fontSize: 10,
        color: "#94A3B8",
    },
    unreadBadge: {
        backgroundColor: "#1890FF",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },
    unreadBadgeText: {
        fontSize: 10,
        color: "#FFFFFF",
        fontWeight: "700",
    },
    lastMessage: {
        fontSize: 12,
        color: "#64748B",
    },
});
