import {
    Ticket,
    TicketMessage,
    ticketsService,
} from "@/services/ticketsService";
import { useAppSelector } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://3cschool.net";

interface DisplayMessage {
    id: string;
    type: "sent" | "received";
    sender?: string;
    senderAvatar?: string | null;
    text: string;
    time: string;
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getStatusStyle(status: string) {
    switch (status) {
        case "in_progress":
            return {
                backgroundColor: "#e6f7fd",
                color: "#00aeed",
                label: "In Progress",
            };
        case "resolved":
            return {
                backgroundColor: "#d1fae5",
                color: "#2bb673",
                label: "Resolved",
            };
        case "open":
            return {
                backgroundColor: "#fef3c7",
                color: "#d97706",
                label: "Open",
            };
        case "closed":
            return {
                backgroundColor: "#e5e7eb",
                color: "#6b7280",
                label: "Closed",
            };
        default:
            return {
                backgroundColor: "#e5e7eb",
                color: "#6b7280",
                label: status,
            };
    }
}

function DateSeparator() {
    return (
        <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>Today</Text>
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
            <Text
                style={[
                    styles.messageTime,
                    isSent ? styles.sentTime : styles.receivedTime,
                ]}
            >
                {message.time}
            </Text>
        </View>
    );
}

export default function TicketDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAppSelector((state) => state.auth);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [messageText, setMessageText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const currentUserId = user?.id;

    const mapMessageToDisplay = useCallback(
        (msg: TicketMessage): DisplayMessage => ({
            id: msg.id.toString(),
            type: msg.sender_id === currentUserId ? "sent" : "received",
            sender:
                msg.sender_id !== currentUserId
                    ? msg.sender?.full_name || "Support"
                    : undefined,
            senderAvatar:
                msg.sender_id !== currentUserId && msg.sender?.avatar
                    ? `${BASE_URL}${msg.sender.avatar}`
                    : null,
            text: msg.message,
            time: formatTime(msg.created_at),
        }),
        [currentUserId],
    );

    const fetchTicket = useCallback(async () => {
        if (!id) return;

        try {
            setError(null);
            const response = await ticketsService.getTicket(Number(id));

            if (response.data) {
                setTicket(response.data);

                // Convert ticket description as first message and replies
                const allMessages: DisplayMessage[] = [];

                // Add initial ticket description as first message
                allMessages.push({
                    id: "ticket-desc",
                    type: "sent",
                    text: response.data.description,
                    time: formatTime(response.data.created_at),
                });

                // Add messages
                if (response.data.messages) {
                    response.data.messages.forEach((msg: TicketMessage) => {
                        allMessages.push(mapMessageToDisplay(msg));
                    });
                }

                setMessages(allMessages);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load ticket");
        } finally {
            setIsLoading(false);
        }
    }, [id, mapMessageToDisplay]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const handleSend = async () => {
        if (!messageText.trim() || !id || isSending) return;

        const trimmedMessage = messageText.trim();
        setMessageText("");
        setIsSending(true);

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const nowTimestamp = Math.floor(Date.now() / 1000);
        const optimisticMessage: DisplayMessage = {
            id: tempId,
            type: "sent",
            text: trimmedMessage,
            time: formatTime(nowTimestamp),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const response = await ticketsService.replyToTicket(
                Number(id),
                trimmedMessage,
            );

            if (response.data) {
                // Replace temp message with real one
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempId
                            ? mapMessageToDisplay(response.data)
                            : msg,
                    ),
                );
            }
        } catch (err: any) {
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            setMessageText(trimmedMessage);
        } finally {
            setIsSending(false);
        }
    };

    const renderMessage = ({ item }: { item: DisplayMessage }) => {
        return <MessageBubble message={item} />;
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
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
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>Loading...</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00aeed" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !ticket) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
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
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>Error</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={48}
                        color="#dc2626"
                    />
                    <Text style={styles.errorText}>
                        {error || "Ticket not found"}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchTicket}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusStyle = getStatusStyle(ticket.status);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
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
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {ticket.title}
                        </Text>
                        <View style={styles.headerSubtitleContainer}>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            statusStyle.backgroundColor,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: statusStyle.color },
                                    ]}
                                >
                                    {statusStyle.label}
                                </Text>
                            </View>
                            <Text style={styles.ticketNumber}>
                                Ticket #{ticket.id}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.infoButton}
                    onPress={fetchTicket}
                >
                    <Ionicons
                        name="refresh-outline"
                        size={24}
                        color="#111827"
                    />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.messagesContainer}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={[
                        styles.messagesList,
                        isTablet && {
                            maxWidth: 600,
                            alignSelf: "center",
                            width: "100%",
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<DateSeparator />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No messages yet
                            </Text>
                        </View>
                    }
                />

                {/* Input Area */}
                <View
                    style={[
                        styles.inputArea,
                        isTablet && {
                            maxWidth: 600,
                            alignSelf: "center",
                            width: "100%",
                        },
                    ]}
                >
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="attach" size={24} color="#6b7280" />
                    </TouchableOpacity>

                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your message…"
                            placeholderTextColor="rgba(10, 10, 10, 0.5)"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
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
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 8,
    },
    backButton: {
        padding: 4,
    },
    headerInfo: {
        flex: 1,
        gap: 4,
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
    statusBadge: {
        backgroundColor: "#00aeed",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "400",
        color: "#ffffff",
    },
    ticketNumber: {
        fontSize: 12,
        fontWeight: "400",
        color: "#6b7280",
        opacity: 0.9,
    },
    infoButton: {
        padding: 8,
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    dateSeparator: {
        alignSelf: "center",
        backgroundColor: "#f9fafb",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 100,
        marginVertical: 16,
    },
    dateSeparatorText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
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
        fontSize: 14,
        fontWeight: "400",
        color: "#2e2e2e",
        marginBottom: 4,
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sentBubble: {
        backgroundColor: "#00aeed",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    receivedBubble: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    messageText: {
        fontSize: 16,
        fontWeight: "400",
        color: "#2e2e2e",
        lineHeight: 28,
    },
    sentMessageText: {
        color: "#ffffff",
    },
    messageTime: {
        fontSize: 12,
        fontWeight: "400",
        color: "#6b7280",
    },
    sentTime: {
        textAlign: "right",
    },
    receivedTime: {
        textAlign: "left",
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
        borderRadius: 14,
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
        borderRadius: 14,
        backgroundColor: "#9ca3af",
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonActive: {
        backgroundColor: "#00aeed",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 14,
        color: "#dc2626",
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: "#00aeed",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    emptyContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 14,
        color: "#6b7280",
    },
});
