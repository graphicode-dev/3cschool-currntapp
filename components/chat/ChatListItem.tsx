import { ThemedText } from "@/components/themed-text";
import { MappedGroup } from "@/hooks/useGroupChats";
import { formatMessageTime } from "@/utils";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "../avatar";

interface BasicChatListItemProps {
    chat: MappedGroup;
    isSelected?: boolean;
    onClick: (chat: MappedGroup) => void;
    onLongPress?: (chatId: string) => void;
}

export const ChatListItem = ({
    chat,
    isSelected,
    onClick,
    onLongPress,
}: BasicChatListItemProps) => {
    return (
        <TouchableOpacity
            onPress={() => onClick(chat)}
            onLongPress={() => onLongPress?.(chat.id.toString())}
            delayLongPress={500}
            style={[styles.item, isSelected && styles.itemSelected]}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <Avatar image={chat.thumbnail} name={chat.name} size={50} />

            {/* ThemedText */}
            <View style={styles.info}>
                <ThemedText style={styles.name} numberOfLines={1}>
                    {chat.name}
                </ThemedText>
                <ThemedText style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage?.has_attachment ? (
                        <>
                            {chat.lastMessage?.sender?.full_name}: 📎{" "}
                            {chat.lastMessage?.attachment_type || "file"}
                        </>
                    ) : (
                        <>
                            {chat.lastMessage?.sender?.full_name}:{" "}
                            {chat.lastMessage?.message}
                        </>
                    )}
                </ThemedText>
            </View>

            {/* Time + Unread */}
            <View style={styles.rightCol}>
                <ThemedText style={styles.time}>
                    {chat.lastMessage?.created_at
                        ? formatMessageTime(chat.lastMessage.created_at, false)
                        : ""}
                </ThemedText>
                {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <ThemedText style={styles.unreadBadgeText}>
                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
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
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 4,
        height: "100%",
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
