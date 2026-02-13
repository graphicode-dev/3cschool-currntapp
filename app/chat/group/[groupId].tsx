import {
    Message,
    messagesService,
    Pagination,
} from "@/services/messagesService";
import { useAppSelector } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
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
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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
    senderId?: number;
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

function getInitials(name: string): string {
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
    const colors = ["#00aeed", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function normalizeUrl(raw: string) {
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
}

function normalizePhone(raw: string) {
    const cleaned = raw.replace(/[^\d+]/g, "");
    return `tel:${cleaned}`;
}

function renderTextWithLinks(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/;
    const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;
    const combinedRegex = new RegExp(
        `${urlRegex.source}|${phoneRegex.source}`,
        "g"
    );

    const parts = text.split(combinedRegex);

    return parts
        .filter((p) => p && p.length > 0)
        .map((part, idx) => {
            const isUrl = urlRegex.test(part);
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

    const senderInitials = message.sender ? getInitials(message.sender) : "";
    const avatarColor = message.sender ? getAvatarColor(message.sender) : "#00aeed";

    return (
        <View
            style={[
                styles.messageBubbleContainer,
                isSent ? styles.sentContainer : styles.receivedContainer,
            ]}
        >
            {!isSent && (
                <View style={styles.avatarAndMessage}>
                    {message.senderAvatar ? (
                        <Image
                            source={{ uri: message.senderAvatar }}
                            style={styles.messageAvatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.messageAvatarInitials, { backgroundColor: avatarColor }]}>
                            <Text style={styles.messageAvatarText}>{senderInitials}</Text>
                        </View>
                    )}
                    <View style={styles.messageContent}>
                        {message.sender && (
                            <Text style={styles.senderName}>{message.sender}</Text>
                        )}
                        <Pressable
                            onLongPress={handleCopy}
                            delayLongPress={350}
                            style={[styles.messageBubble, styles.receivedBubble]}
                        >
                            {hasText && (
                                <Text style={styles.messageText}>
                                    {renderTextWithLinks(message.text)}
                                </Text>
                            )}
                            {!!message.attachmentUrl && (
                                <TouchableOpacity
                                    style={[styles.attachmentRow, !hasText ? styles.attachmentRowNoText : null]}
                                    onPress={() => Linking.openURL(message.attachmentUrl!)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="attach" size={16} color="#111827" />
                                    <Text style={styles.attachmentText} numberOfLines={1}>
                                        {message.attachmentName || "Attachment"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </Pressable>
                        {message.time && (
                            <Text style={[styles.messageTime, styles.receivedTime]}>
                                {message.time}
                            </Text>
                        )}
                    </View>
                </View>
            )}
            {isSent && (
                <>
                    <Pressable
                        onLongPress={handleCopy}
                        delayLongPress={350}
                        style={[styles.messageBubble, styles.sentBubble]}
                    >
                        {hasText && (
                            <Text style={[styles.messageText, styles.sentMessageText]}>
                                {renderTextWithLinks(message.text)}
                            </Text>
                        )}
                        {!!message.attachmentUrl && (
                            <TouchableOpacity
                                style={[
                                    styles.attachmentRow,
                                    !hasText ? styles.attachmentRowNoText : null,
                                    styles.sentAttachmentRow,
                                ]}
                                onPress={() => Linking.openURL(message.attachmentUrl!)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="attach" size={16} color="#ffffff" />
                                <Text style={[styles.attachmentText, styles.sentAttachmentText]} numberOfLines={1}>
                                    {message.attachmentName || "Attachment"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Pressable>
                    {message.time && (
                        <Text style={[styles.messageTime, styles.sentTime]}>
                            {message.time}
                        </Text>
                    )}
                </>
            )}
        </View>
    );
}

export default function GroupChatScreen() {
    const router = useRouter();
    const { groupId, groupName } = useLocalSearchParams<{
        groupId: string;
        groupName?: string;
    }>();
    const { user } = useAppSelector((state) => state.auth);
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [messageText, setMessageText] = useState("");
    const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);
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
            sender: msg.sender_id !== currentUserId ? msg.sender.full_name : undefined,
            senderId: msg.sender_id,
            senderAvatar: msg.sender_id !== currentUserId && msg.sender.avatar
                ? `${BASE_URL}${msg.sender.avatar}`
                : null,
            text: msg.message || "",
            attachmentUrl: msg.attachment_url || (msg.attachment_path ? `${BASE_URL}/${msg.attachment_path}` : null),
            attachmentName: msg.attachment_name || null,
            time: formatTime(msg.created_at),
            isRead: msg.read_at !== null,
        }),
        [currentUserId],
    );

    const fetchMessages = useCallback(
        async (page: number = 1, append: boolean = false) => {
            if (!groupId) return;

            try {
                setError(null);
                if (append) {
                    setIsLoadingMore(true);
                }

                const response = await messagesService.getGroupChatMessages(
                    Number(groupId),
                    page,
                );

                if (response.data) {
                    const displayMessages: DisplayMessage[] = response.data.map(mapMessageToDisplay);

                    if (append) {
                        setMessages((prev) => [...prev, ...displayMessages]);
                    } else {
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
        [groupId, mapMessageToDisplay],
    );

    useEffect(() => {
        fetchMessages(1, false);
    }, [fetchMessages]);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        if (!groupId) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await messagesService.getGroupChatMessages(
                    Number(groupId),
                    1,
                );

                if (response.data && response.data.length > 0) {
                    setMessages((prevMessages) => {
                        const existingIds = new Set(
                            prevMessages
                                .filter((m) => !m.id.startsWith("temp-"))
                                .map((m) => m.id),
                        );

                        const newMessages = response.data
                            .map(mapMessageToDisplay)
                            .filter((msg) => !existingIds.has(msg.id));

                        if (newMessages.length > 0) {
                            return [...newMessages, ...prevMessages];
                        }
                        return prevMessages;
                    });
                }
            } catch (err) {
                console.log("Polling error:", err);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [groupId, mapMessageToDisplay]);

    const loadMoreMessages = useCallback(() => {
        if (isLoadingMore || !pagination || currentPage >= pagination.last_page) {
            return;
        }
        fetchMessages(currentPage + 1, true);
    }, [isLoadingMore, pagination, currentPage, fetchMessages]);

    const handlePickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Please allow access to your photo library to send images.");
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
            { cancelable: true }
        );
    };

    const handleSend = async () => {
        if (isSending || !groupId) return;

        const trimmedMessage = messageText.trim();
        const hasText = trimmedMessage.length > 0;
        const hasAttachment = !!selectedAttachment;

        if (!hasText && !hasAttachment) return;

        const attachmentToSend = selectedAttachment;
        setMessageText("");
        setSelectedAttachment(null);
        setIsSending(true);

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
            const response = await messagesService.sendGroupChatMessage(
                Number(groupId),
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
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempId ? mapMessageToDisplay(response.data) : msg,
                    ),
                );
            }
        } catch (err: any) {
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            setMessageText(trimmedMessage);
            setSelectedAttachment(attachmentToSend);
            setError(err.message || "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const renderMessage = ({ item }: { item: DisplayMessage }) => {
        return <MessageBubble message={item} />;
    };

    const displayName = groupName || "Group Chat";

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.groupAvatarContainer}>
                        <Ionicons name="people" size={24} color="#ffffff" />
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
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>

                <View style={styles.groupAvatarContainer}>
                    <Ionicons name="people" size={24} color="#ffffff" />
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <View style={styles.headerSubtitleContainer}>
                        <Text style={styles.headerSubtitle}>Group Chat</Text>
                        <Text style={styles.headerDot}>•</Text>
                        <Text style={styles.headerStatus}>
                            {pagination?.total || 0} messages
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.pollsButton}
                    onPress={() => router.push({
                        pathname: `/group/${groupId}/polls`,
                        params: { groupName: groupName }
                    } as any)}
                >
                    <Ionicons name="bar-chart" size={22} color="#8b5cf6" />
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
                                <ActivityIndicator size="small" color="#00aeed" />
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
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
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
                                <Text style={styles.attachmentPreviewText} numberOfLines={1}>
                                    {selectedAttachment.name}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.attachmentPreviewChip}>
                                <Ionicons name="document" size={16} color="#111827" />
                                <Text style={styles.attachmentPreviewText} numberOfLines={1}>
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
                <View style={styles.inputArea}>
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
                            (messageText.trim() || selectedAttachment) && !isSending
                                ? styles.sendButtonActive
                                : null,
                        ]}
                        onPress={handleSend}
                        disabled={
                            isSending || (!messageText.trim() && !selectedAttachment)
                        }
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Ionicons
                                name="send"
                                size={20}
                                color={
                                    messageText.trim() || selectedAttachment
                                        ? "#ffffff"
                                        : "#9ca3af"
                                }
                            />
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
        backgroundColor: "#f9fafb",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        padding: 8,
        marginRight: 4,
    },
    groupAvatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#00aeed",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    pollsButton: {
        padding: 8,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#111827",
    },
    headerSubtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#6b7280",
    },
    headerDot: {
        fontSize: 13,
        color: "#6b7280",
        marginHorizontal: 6,
    },
    headerStatus: {
        fontSize: 13,
        color: "#10b981",
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
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
        marginRight: 12,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageBubbleContainer: {
        marginVertical: 4,
    },
    sentContainer: {
        alignItems: "flex-end",
    },
    receivedContainer: {
        alignItems: "flex-start",
    },
    avatarAndMessage: {
        flexDirection: "row",
        alignItems: "flex-end",
        maxWidth: "85%",
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageAvatarInitials: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    messageAvatarText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ffffff",
    },
    messageContent: {
        flex: 1,
    },
    senderName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 4,
        marginLeft: 4,
    },
    messageBubble: {
        maxWidth: "100%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    sentBubble: {
        backgroundColor: "#00aeed",
        borderBottomRightRadius: 4,
        maxWidth: "80%",
    },
    receivedBubble: {
        backgroundColor: "#ffffff",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
        color: "#111827",
    },
    sentMessageText: {
        color: "#ffffff",
    },
    linkText: {
        color: "#2563eb",
        textDecorationLine: "underline",
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
    },
    sentTime: {
        color: "#9ca3af",
        textAlign: "right",
        marginRight: 4,
    },
    receivedTime: {
        color: "#9ca3af",
        marginLeft: 4,
    },
    attachmentRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
        gap: 6,
    },
    attachmentRowNoText: {
        marginTop: 0,
        paddingTop: 0,
        borderTopWidth: 0,
    },
    sentAttachmentRow: {
        borderTopColor: "rgba(255,255,255,0.3)",
    },
    attachmentText: {
        fontSize: 13,
        color: "#111827",
        flex: 1,
    },
    sentAttachmentText: {
        color: "#ffffff",
    },
    dateSeparator: {
        alignItems: "center",
        marginVertical: 16,
    },
    dateSeparatorText: {
        fontSize: 12,
        color: "#9ca3af",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    loadingMoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 13,
        color: "#6b7280",
    },
    emptyContainerInverted: {
        alignItems: "center",
        paddingVertical: 40,
        transform: [{ scaleY: -1 }],
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#9ca3af",
        marginBottom: 16,
        textAlign: "center",
    },
    attachmentPreviewRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#f3f4f6",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    attachmentPreviewChip: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    imagePreviewContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 8,
    },
    imagePreviewThumb: {
        width: 40,
        height: 40,
        borderRadius: 6,
    },
    attachmentPreviewText: {
        flex: 1,
        fontSize: 13,
        color: "#374151",
    },
    attachmentRemoveButton: {
        padding: 8,
        marginLeft: 8,
    },
    inputArea: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    attachButton: {
        padding: 8,
        marginRight: 4,
    },
    textInputContainer: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 120,
    },
    textInput: {
        fontSize: 15,
        color: "#111827",
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    sendButtonActive: {
        backgroundColor: "#00aeed",
    },
});
