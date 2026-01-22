import {
  Message,
  messagesService,
  Pagination,
} from "@/services/messagesService";
import { useAppSelector } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://3cschool.net";

interface DisplayMessage {
    id: string;
    type: "system" | "received" | "sent";
    sender?: string;
    senderAvatar?: string | null;
    text: string;
    time?: string;
    isRead?: boolean;
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
}

function DateSeparator({ date }: { date: string }) {
    return (
        <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{date}</Text>
        </View>
    );
}

function SystemMessage({ text }: { text: string }) {
    return (
        <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{text}</Text>
        </View>
    );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
    const isSent = message.type === "sent";

    return (
        <View
            style={[
                styles.messageBubbleContainer,
                isSent ? styles.sentContainer : styles.receivedContainer,
            ]}
        >
            {!isSent && message.sender && (
                <Text style={styles.senderName}>{message.sender}</Text>
            )}
            <View
                style={[
                    styles.messageBubble,
                    isSent ? styles.sentBubble : styles.receivedBubble,
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        isSent && styles.sentMessageText,
                    ]}
                >
                    {message.text}
                </Text>
            </View>
            {message.time && (
                <Text
                    style={[
                        styles.messageTime,
                        isSent ? styles.sentTime : styles.receivedTime,
                    ]}
                >
                    {message.time}
                </Text>
            )}
        </View>
    );
}

export default function PrivateChatScreen() {
    const router = useRouter();
    const { groupId, userId, userName, userAvatar } = useLocalSearchParams<{
        groupId: string;
        userId: string;
        userName?: string;
        userAvatar?: string;
    }>();
    const { user } = useAppSelector((state) => state.auth);
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [messageText, setMessageText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const flatListRef = useRef<FlatList>(null);

    const currentUserId = user?.id;

    const mapMessageToDisplay = useCallback(
        (msg: Message): DisplayMessage => ({
            id: msg.id.toString(),
            type: msg.sender_id === currentUserId ? "sent" : "received",
            sender:
                msg.sender_id !== currentUserId
                    ? msg.sender.full_name
                    : undefined,
            senderAvatar:
                msg.sender_id !== currentUserId
                    ? msg.sender.avatar
                        ? `${BASE_URL}${msg.sender.avatar}`
                        : null
                    : null,
            text: msg.message,
            time: formatTime(msg.created_at),
            isRead: msg.read_at !== null,
        }),
        [currentUserId],
    );

    const fetchMessages = useCallback(
        async (page: number = 1, append: boolean = false) => {
            if (!groupId || !userId) return;

            try {
                setError(null);
                if (append) {
                    setIsLoadingMore(true);
                }

                const response = await messagesService.getMessages(
                    Number(groupId),
                    Number(userId),
                    page,
                );

                if (response.data) {
                    const displayMessages: DisplayMessage[] =
                        response.data.map(mapMessageToDisplay);

                    if (append) {
                        // Prepend older messages (API returns newest first)
                        setMessages((prev) => [...prev, ...displayMessages]);
                    } else {
                        // Initial load - messages are already newest first from API
                        setMessages(displayMessages);
                    }

                    setPagination(response.pagination);
                    setCurrentPage(page);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load messages");
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [groupId, userId, mapMessageToDisplay],
    );

    useEffect(() => {
        fetchMessages(1, false);
    }, [fetchMessages]);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        if (!groupId || !userId) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await messagesService.getMessages(
                    Number(groupId),
                    Number(userId),
                    1,
                );

                if (response.data && response.data.length > 0) {
                    setMessages((prevMessages) => {
                        // Get IDs of existing messages (excluding temp messages)
                        const existingIds = new Set(
                            prevMessages
                                .filter((m) => !m.id.startsWith("temp-"))
                                .map((m) => m.id),
                        );

                        // Find new messages from API
                        const newMessages = response.data
                            .map(mapMessageToDisplay)
                            .filter((msg) => !existingIds.has(msg.id));

                        if (newMessages.length > 0) {
                            // Add new messages at the beginning (newest first for inverted list)
                            return [...newMessages, ...prevMessages];
                        }
                        return prevMessages;
                    });
                }
            } catch (err) {
                // Silently fail polling - don't show errors for background refresh
                console.log("Polling error:", err);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [groupId, userId, mapMessageToDisplay]);

    const loadMoreMessages = useCallback(() => {
        if (
            isLoadingMore ||
            !pagination ||
            currentPage >= pagination.last_page
        ) {
            return;
        }
        fetchMessages(currentPage + 1, true);
    }, [isLoadingMore, pagination, currentPage, fetchMessages]);

    const handleSend = async () => {
        if (!messageText.trim() || isSending || !groupId || !userId) return;

        const trimmedMessage = messageText.trim();
        setMessageText("");
        setIsSending(true);

        // Optimistically add the message at the beginning (newest first for inverted list)
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: DisplayMessage = {
            id: tempId,
            type: "sent",
            text: trimmedMessage,
            time: formatTime(new Date().toISOString()),
        };
        setMessages((prev) => [optimisticMessage, ...prev]);

        try {
            const response = await messagesService.sendMessage(
                Number(groupId),
                Number(userId),
                trimmedMessage,
            );

            if (response.data) {
                // Replace optimistic message with real one
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempId
                            ? {
                                  id: response.data.id.toString(),
                                  type: "sent",
                                  text: response.data.message,
                                  time: formatTime(response.data.created_at),
                                  isRead: response.data.read_at !== null,
                              }
                            : msg,
                    ),
                );
            }
        } catch (err: any) {
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            setMessageText(trimmedMessage); // Restore the message
            setError(err.message || "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const renderMessage = ({ item }: { item: DisplayMessage }) => {
        if (item.type === "system") {
            return <SystemMessage text={item.text} />;
        }
        return <MessageBubble message={item} />;
    };

    const displayName = userName || "Chat";

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color="#111827"
                        />
                    </TouchableOpacity>
                    <View style={styles.avatarContainer}>
                        <Ionicons
                            name="person-outline"
                            size={24}
                            color="#00aeed"
                        />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{displayName}</Text>
                        <Text style={styles.headerSubtitle}>Loading...</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00aeed" />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>

                <View style={styles.avatarContainer}>
                    {userAvatar ? (
                        <Image
                            source={{ uri: userAvatar }}
                            style={styles.headerAvatar}
                            contentFit="cover"
                        />
                    ) : (
                        <Ionicons
                            name="person-outline"
                            size={24}
                            color="#00aeed"
                        />
                    )}
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <View style={styles.headerSubtitleContainer}>
                        <Text style={styles.headerSubtitle}>Private Chat</Text>
                        <Text style={styles.headerDot}>•</Text>
                        <Text style={styles.headerStatus}>Active</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons
                        name="ellipsis-vertical"
                        size={24}
                        color="#111827"
                    />
                </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity onPress={() => setError(null)}>
                        <Ionicons name="close" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Messages */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.messagesContainer}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    inverted
                    onEndReached={loadMoreMessages}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <View style={styles.loadingMoreContainer}>
                                <ActivityIndicator
                                    size="small"
                                    color="#00aeed"
                                />
                                <Text style={styles.loadingMoreText}>
                                    Loading older messages...
                                </Text>
                            </View>
                        ) : pagination && currentPage < pagination.last_page ? (
                            <View style={styles.dateSeparator}>
                                <Text style={styles.dateSeparatorText}>
                                    Scroll up for more
                                </Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainerInverted}>
                            <Text style={styles.emptySubtext}>
                                Start the conversation by sending a message
                            </Text>
                            <Text style={styles.emptyText}>
                                No messages yet
                            </Text>
                            <Ionicons
                                name="chatbubbles-outline"
                                size={48}
                                color="#9ca3af"
                            />
                        </View>
                    }
                />

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="attach" size={24} color="#6b7280" />
                    </TouchableOpacity>

                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your message..."
                            placeholderTextColor="rgba(10, 10, 10, 0.5)"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            editable={!isSending}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            messageText.trim() && !isSending
                                ? styles.sendButtonActive
                                : null,
                        ]}
                        onPress={handleSend}
                        disabled={!messageText.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#ffffff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        gap: 8,
    },
    backButton: {
        padding: 4,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#e6f7fd",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    headerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        lineHeight: 24,
    },
    headerSubtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: "400",
        color: "#6b7280",
        lineHeight: 16,
    },
    headerDot: {
        fontSize: 12,
        color: "#6b7280",
    },
    headerStatus: {
        fontSize: 12,
        fontWeight: "400",
        color: "#22c55e",
        lineHeight: 16,
    },
    menuButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#6b7280",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#dc2626",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 14,
        color: "#ffffff",
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    dateSeparator: {
        alignSelf: "center",
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        marginVertical: 16,
    },
    dateSeparatorText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
    },
    systemMessage: {
        alignSelf: "center",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        marginVertical: 8,
    },
    systemMessageText: {
        fontSize: 12,
        fontWeight: "400",
        color: "#6b7280",
        textAlign: "center",
    },
    messageBubbleContainer: {
        marginVertical: 4,
        maxWidth: "75%",
        gap: 4,
    },
    sentContainer: {
        alignSelf: "flex-end",
        alignItems: "flex-end",
    },
    receivedContainer: {
        alignSelf: "flex-start",
        alignItems: "flex-start",
    },
    senderName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
        marginLeft: 12,
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sentBubble: {
        backgroundColor: "#00aeed",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 4,
    },
    receivedBubble: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 16,
    },
    messageText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#111827",
        lineHeight: 22,
    },
    sentMessageText: {
        color: "#ffffff",
    },
    messageTime: {
        fontSize: 11,
        fontWeight: "400",
        color: "#9ca3af",
        marginHorizontal: 4,
    },
    sentTime: {
        textAlign: "right",
    },
    receivedTime: {
        textAlign: "left",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
        gap: 8,
    },
    emptyContainerInverted: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
        gap: 8,
        transform: [{ scaleY: -1 }],
    },
    loadingMoreContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 12,
        color: "#6b7280",
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6b7280",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#9ca3af",
        textAlign: "center",
    },
    inputArea: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        gap: 8,
    },
    attachButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    textInputContainer: {
        flex: 1,
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minHeight: 42,
        maxHeight: 100,
    },
    textInput: {
        fontSize: 14,
        fontWeight: "400",
        color: "#111827",
        lineHeight: 20,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#9ca3af",
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonActive: {
        backgroundColor: "#00aeed",
    },
});
