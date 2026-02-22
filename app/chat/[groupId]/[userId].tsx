import {
    Message,
    messagesService,
    Pagination,
} from "@/services/messagesService";
import { useAppSelector } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Linking,
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

type SelectedAttachment = {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
};

interface DisplayMessage {
    id: string;
    type: "system" | "received" | "sent";
    sender?: string;
    senderAvatar?: string | null;
    text: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
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

function normalizeUrl(raw: string) {
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
}

function normalizePhone(raw: string) {
    // Remove all non-digit characters except leading +
    const cleaned = raw.replace(/[^\d+]/g, "");
    return `tel:${cleaned}`;
}

function renderTextWithLinks(text: string) {
    // Combined regex for URLs and phone numbers
    const urlRegex =
        /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/;
    const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;
    const combinedRegex = new RegExp(
        `${urlRegex.source}|${phoneRegex.source}`,
        "g",
    );

    const parts = text.split(combinedRegex);

    return parts
        .filter((p) => p && p.length > 0)
        .map((part, idx) => {
            // Check if it's a URL
            const isUrl = urlRegex.test(part);
            // Check if it's a phone number (at least 8 digits)
            const digitCount = (part.match(/\d/g) || []).length;
            const isPhone = phoneRegex.test(part) && digitCount >= 8;

            if (!isUrl && !isPhone) {
                return <Text key={`t-${idx}`}>{part}</Text>;
            }

            if (isPhone) {
                return (
                    <Text
                        key={`p-${idx}`}
                        style={styles.linkText}
                        onPress={() => Linking.openURL(normalizePhone(part))}
                    >
                        {part}
                    </Text>
                );
            }

            const url = normalizeUrl(part);
            return (
                <Text
                    key={`u-${idx}`}
                    style={styles.linkText}
                    onPress={() => Linking.openURL(url)}
                >
                    {part}
                </Text>
            );
        });
}

function MessageBubble({ message }: { message: DisplayMessage }) {
    const isSent = message.type === "sent";
    const hasText = (message.text || "").trim().length > 0;

    const handleCopy = async () => {
        if (!message.text) return;
        await Clipboard.setStringAsync(message.text);
        Alert.alert("Copied", "Message copied to clipboard");
    };

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
            <TouchableOpacity
                onLongPress={handleCopy}
                delayLongPress={350}
                style={[
                    styles.messageBubble,
                    isSent ? styles.sentBubble : styles.receivedBubble,
                ]}
            >
                {hasText && (
                    <Text
                        style={[
                            styles.messageText,
                            isSent && styles.sentMessageText,
                        ]}
                    >
                        {renderTextWithLinks(message.text)}
                    </Text>
                )}

                {!!message.attachmentUrl && (
                    <TouchableOpacity
                        style={[
                            styles.attachmentRow,
                            !hasText ? styles.attachmentRowNoText : null,
                            isSent
                                ? styles.sentAttachmentRow
                                : styles.receivedAttachmentRow,
                        ]}
                        onPress={() => Linking.openURL(message.attachmentUrl!)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="attach"
                            size={16}
                            color={isSent ? "#ffffff" : "#111827"}
                        />
                        <Text
                            style={[
                                styles.attachmentText,
                                isSent ? styles.sentAttachmentText : null,
                            ]}
                            numberOfLines={1}
                        >
                            {message.attachmentName || "Attachment"}
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
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
    const { groupId, userId, userName, userAvatar, userMobile } =
        useLocalSearchParams<{
            groupId: string;
            userId: string;
            userName?: string;
            userAvatar?: string;
            userMobile?: string;
        }>();
    const { user } = useAppSelector((state) => state.auth);
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [messageText, setMessageText] = useState("");
    const [selectedAttachment, setSelectedAttachment] =
        useState<SelectedAttachment | null>(null);
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
            attachmentUrl:
                msg.attachment_url ||
                (msg.attachment_path
                    ? `${BASE_URL}/${msg.attachment_path}`
                    : null),
            attachmentName: msg.attachment_name || null,
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

    const handlePickImage = async () => {
        try {
            const permissionResult =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    "Permission Required",
                    "Please allow access to your photo library to send images.",
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset) return;

            const fileName = asset.uri.split("/").pop() || "image.jpg";
            setSelectedAttachment({
                uri: asset.uri,
                name: fileName,
                mimeType: asset.mimeType || "image/jpeg",
                size: asset.fileSize,
            });
        } catch {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: false,
                multiple: false,
            });

            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset) return;

            setSelectedAttachment({
                uri: asset.uri,
                name: asset.name,
                mimeType: asset.mimeType,
                size: asset.size,
            });
        } catch {
            Alert.alert("Error", "Failed to pick file");
        }
    };

    const handlePickAttachment = () => {
        Alert.alert(
            "Send Attachment",
            "Choose what to send",
            [
                { text: "Photo", onPress: handlePickImage },
                { text: "File", onPress: handlePickDocument },
                { text: "Cancel", style: "cancel" },
            ],
            { cancelable: true },
        );
    };

    const handleSend = async () => {
        if (isSending || !groupId || !userId) return;

        const trimmedMessage = messageText.trim();
        const hasText = trimmedMessage.length > 0;
        const hasAttachment = !!selectedAttachment;

        if (!hasText && !hasAttachment) return;

        const attachmentToSend = selectedAttachment;
        setMessageText("");
        setSelectedAttachment(null);
        setIsSending(true);

        // Optimistically add the message at the beginning (newest first for inverted list)
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: DisplayMessage = {
            id: tempId,
            type: "sent",
            text: trimmedMessage,
            time: formatTime(new Date().toISOString()),
            attachmentUrl: null,
            attachmentName: attachmentToSend ? attachmentToSend.name : null,
        };
        setMessages((prev) => [optimisticMessage, ...prev]);

        try {
            const response = await messagesService.sendMessage(
                Number(groupId),
                Number(userId),
                hasText ? trimmedMessage : undefined,
                attachmentToSend
                    ? {
                          uri: attachmentToSend.uri,
                          name: attachmentToSend.name,
                          mimeType: attachmentToSend.mimeType,
                      }
                    : undefined,
            );

            if (response.data) {
                // Replace optimistic message with real one
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
            setSelectedAttachment(attachmentToSend);
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

                <TouchableOpacity
                    style={styles.ringButton}
                    onPress={async () => {
                        if (isSending) return;
                        // Vibrate immediately for feedback
                        Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success,
                        );
                        try {
                            await messagesService.sendMessage(
                                Number(groupId),
                                Number(userId),
                                "🔔 Ring!",
                            );
                            // Vibrate again on success
                            Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Success,
                            );
                        } catch (err: any) {
                            Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Error,
                            );
                            Alert.alert(
                                "Error",
                                err.message || "Failed to send ring",
                            );
                        }
                    }}
                    disabled={isSending}
                >
                    <Ionicons name="notifications" size={22} color="#f59e0b" />
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
                    contentContainerStyle={[
                        styles.messagesList,
                        isTablet && {
                            maxWidth: 700,
                            alignSelf: "center" as const,
                            width: "100%" as const,
                        },
                    ]}
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

                {!!selectedAttachment && (
                    <View style={styles.attachmentPreviewRow}>
                        {selectedAttachment.mimeType?.startsWith("image/") ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: selectedAttachment.uri }}
                                    style={styles.imagePreviewThumb}
                                    contentFit="cover"
                                />
                                <Text
                                    style={styles.attachmentPreviewText}
                                    numberOfLines={1}
                                >
                                    {selectedAttachment.name}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.attachmentPreviewChip}>
                                <Ionicons
                                    name="document"
                                    size={16}
                                    color="#111827"
                                />
                                <Text
                                    style={styles.attachmentPreviewText}
                                    numberOfLines={1}
                                >
                                    {selectedAttachment.name}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.attachmentRemoveButton}
                            onPress={() => setSelectedAttachment(null)}
                        >
                            <Ionicons name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Input Area */}
                <View
                    style={[
                        styles.inputArea,
                        isTablet && {
                            maxWidth: 700,
                            alignSelf: "center" as const,
                            width: "100%" as const,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.attachButton}
                        onPress={handlePickAttachment}
                        disabled={isSending}
                    >
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
                            (messageText.trim() || selectedAttachment) &&
                            !isSending
                                ? styles.sendButtonActive
                                : null,
                        ]}
                        onPress={handleSend}
                        disabled={
                            (!messageText.trim() && !selectedAttachment) ||
                            isSending
                        }
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
    ringButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fef3c7",
        alignItems: "center",
        justifyContent: "center",
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
        fontSize: 16,
        fontWeight: "400",
        color: "#111827",
        lineHeight: 22,
    },
    attachmentRow: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingTop: 10,
        borderTopWidth: 1,
    },
    attachmentRowNoText: {
        marginTop: 0,
        paddingTop: 0,
        borderTopWidth: 0,
    },
    sentAttachmentRow: {
        borderTopColor: "rgba(255,255,255,0.2)",
    },
    receivedAttachmentRow: {
        borderTopColor: "rgba(17,24,39,0.08)",
    },
    attachmentText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
        textDecorationLine: "underline",
    },
    sentAttachmentText: {
        color: "#ffffff",
    },
    linkText: {
        color: "#2563eb",
        textDecorationLine: "underline",
        fontWeight: "600",
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
    attachmentPreviewRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 6,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    attachmentPreviewChip: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
    },
    imagePreviewContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
    },
    imagePreviewThumb: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    attachmentPreviewText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
    },
    attachmentRemoveButton: {
        marginLeft: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#e5e7eb",
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
