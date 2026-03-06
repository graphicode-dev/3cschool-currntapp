import { Palette } from "@/constants/theme";
import { ChatMessage } from "@/services/chats/chat.types";
import { memo } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "../avatar";
import { ThemedText } from "../themed-text";

// ─── Timestamp formatter ──────────────────────────────────────────────────────

/**
 * Returns a human-readable timestamp for a message.
 *
 * Format:  "<time>  ·  <date>"
 *   time  →  "3:45 pm"
 *   date  →  "Today" | "Yesterday" | "dd/mm/yy"
 */
function formatMessageTime(isoString: string, isMe: boolean): string {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
    const diffDays = Math.round(
        (today.getTime() - msgDay.getTime()) / (1000 * 60 * 60 * 24),
    );

    const time = date
        .toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        .toLowerCase();

    let label: string;
    if (diffDays === 0) {
        label = "Today";
    } else if (diffDays === 1) {
        label = "Yesterday";
    } else {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yy = String(date.getFullYear()).slice(2);
        label = `${dd}/${mm}/${yy}`;
    }

    return isMe ? `${label}  ·  ${time}` : `${time}  ·  ${label}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    message: ChatMessage;
    chatType?: "private" | "group";
    showAvatar?: boolean;
    showSenderName?: boolean;
    onReply?: (message: ChatMessage) => void;
    onNavigateToMessage?: (messageId: string) => void;
    highlightedMessageId?: string;
}

const ChatBubble = ({
    message,
    chatType = "private",
    showAvatar = true,
    showSenderName = false,
    onReply,
    onNavigateToMessage,
    highlightedMessageId,
}: Props) => {
    const isMe = message.sender === "me";
    const isInstructor = message.sender === "instructor";

    const timestamp = formatMessageTime(message.createdAt, isMe);

    const shouldShowSenderName =
        chatType === "group" && !isMe && showSenderName;
    const isHighlighted = highlightedMessageId === message.id;

    const handleReplyPress = () => {
        if (message.replyTo && onNavigateToMessage) {
            onNavigateToMessage(message.replyTo.id);
        }
    };

    const handleLongPress = () => {
        if (onReply) {
            Alert.alert("Reply to Message", message.text, [
                { text: "Cancel", style: "cancel" },
                { text: "Reply", onPress: () => onReply(message) },
            ]);
        }
    };

    return (
        <View
            style={[
                styles.container,
                isMe ? styles.meContainer : styles.otherContainer,
            ]}
        >
            {!isMe && showAvatar && (
                <View style={styles.avatarWrapper}>
                    <Avatar
                        name={message.senderName || (isInstructor ? "I" : "U")}
                        size={44}
                        image={message.avatar}
                    />
                </View>
            )}

            <View
                style={[
                    styles.messageContainer,
                    isMe
                        ? styles.meMessageContainer
                        : styles.otherMessageContainer,
                ]}
            >
                {shouldShowSenderName && (
                    <ThemedText style={styles.senderName}>
                        {message.senderName || "Unknown"}
                    </ThemedText>
                )}

                {message.replyTo && (
                    <TouchableOpacity
                        style={[
                            styles.repliedContainer,
                            isHighlighted && styles.highlightedContainer,
                        ]}
                        onPress={handleReplyPress}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.repliedLabel}>
                            Replying to
                        </ThemedText>
                        <ThemedText
                            style={styles.repliedText}
                            numberOfLines={2}
                        >
                            {message.replyTo.text}
                        </ThemedText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onLongPress={handleLongPress}
                    delayLongPress={500}
                    activeOpacity={0.8}
                >
                    <View
                        style={[
                            styles.bubble,
                            isMe ? styles.meBubble : styles.otherBubble,
                        ]}
                    >
                        <ThemedText
                            style={[styles.text, isMe && styles.meText]}
                        >
                            {message.text}
                        </ThemedText>
                    </View>
                </TouchableOpacity>

                {/* Timestamp: "3:45 pm  ·  Today" */}
                <ThemedText style={[styles.time, isMe && styles.meTime]}>
                    {timestamp}
                </ThemedText>
            </View>

            {isMe && showAvatar && (
                <View style={styles.avatarWrapper}>
                    <Avatar name="B" size={44} />
                </View>
            )}
        </View>
    );
};

export default memo(ChatBubble);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 9,
    },
    meContainer: { justifyContent: "flex-end" },
    otherContainer: { justifyContent: "flex-start" },

    messageContainer: { maxWidth: 281, gap: 5 },
    meMessageContainer: { alignItems: "flex-end" },
    otherMessageContainer: { alignItems: "flex-start" },

    avatarWrapper: { marginHorizontal: 9, marginBottom: 10 },

    senderName: {
        fontSize: 11,
        fontFamily: "Poppins_500Medium",
        color: Palette.slate600,
        marginBottom: 4,
        marginLeft: 4,
    },

    bubble: {
        minHeight: 72,
        paddingHorizontal: 23.57,
        paddingVertical: 18,
        borderRadius: 22,
        borderWidth: 0.8,
        borderColor: Palette.brand[500],
        justifyContent: "center",
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 5.1,
        elevation: 3,
    },
    meBubble: {
        backgroundColor: Palette.brand[300],
        borderWidth: 1,
        borderColor: Palette.brand[700],
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 22,
        boxShadow: "0 1px 5.1px 0 rgba(0, 0, 0, 0.25) inset",
    },
    otherBubble: {
        backgroundColor: "white",
        borderBottomRightRadius: 22,
        borderBottomLeftRadius: 0,
    },

    text: { color: Palette.brand[500] },
    meText: {
        fontSize: 12,
        fontFamily: "Poppins_500Medium",
        lineHeight: 18,
        color: "white",
    },

    time: {
        fontSize: 10,
        fontFamily: "Poppins_500Medium",
        color: Palette.slate700,
    },
    meTime: { textAlign: "right" },

    repliedContainer: {
        backgroundColor: Palette.slate100,
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: Palette.brand[500],
    },
    repliedLabel: {
        fontSize: 10,
        fontFamily: "Poppins_500Medium",
        color: Palette.slate500,
        marginBottom: 2,
    },
    repliedText: {
        fontSize: 11,
        fontFamily: "Poppins_400Regular",
        color: Palette.slate600,
        fontStyle: "italic",
    },
    highlightedContainer: {
        backgroundColor: Palette.brand[100],
        borderLeftColor: Palette.brand[600],
        borderWidth: 2,
        borderColor: Palette.brand[300],
    },
});
