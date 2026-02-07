import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
    id: string;
    type: "system" | "received" | "sent";
    sender?: string;
    text: string;
    time?: string;
}

const MESSAGES: Message[] = [
    {
        id: "1",
        type: "system",
        text: "You joined the class chat",
    },
    {
        id: "2",
        type: "received",
        sender: "Sophie Chen",
        text: "Hi everyone! Welcome to Full Stack Web Development. Feel free to ask any questions here.",
        time: "9:00 AM",
    },
    {
        id: "3",
        type: "sent",
        text: "Thank you, Dr. Chen! I'm excited to get started.",
        time: "9:02 AM",
    },
    {
        id: "4",
        type: "received",
        sender: "Alex Thompson",
        text: "I have a question about the first assignment. Are we allowed to use external libraries?",
        time: "9:05 AM",
    },
    {
        id: "5",
        type: "received",
        sender: "Sophie Chen",
        text: "Great question! Yes, you can use any npm packages, but make sure to document them in your README.",
        time: "9:07 AM",
    },
    {
        id: "6",
        type: "sent",
        text: "Perfect, thanks for clarifying!",
        time: "9:08 AM",
    },
];

function DateSeparator() {
    return (
        <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>Today</Text>
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

function MessageBubble({ message }: { message: Message }) {
    const isSent = message.type === "sent";

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
            <Pressable
                onLongPress={handleCopy}
                delayLongPress={350}
                style={[
                    styles.messageBubble,
                    isSent ? styles.sentBubble : styles.receivedBubble,
                ]}
            >
                <Text style={styles.messageText}>{renderTextWithLinks(message.text)}</Text>
            </Pressable>
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

export default function ChatDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [messageText, setMessageText] = useState("");

    const handleSend = () => {
        if (messageText.trim()) {
            // TODO: Implement send message logic
            setMessageText("");
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        if (item.type === "system") {
            return <SystemMessage text={item.text} />;
        }
        return <MessageBubble message={item} />;
    };

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
                    <Ionicons name="people-outline" size={24} color="#00aeed" />
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>
                        Full Stack Web Development
                    </Text>
                    <View style={styles.headerSubtitleContainer}>
                        <Text style={styles.headerSubtitle}>Class Group</Text>
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

            {/* Messages */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.messagesContainer}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    data={MESSAGES}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<DateSeparator />}
                />

                {/* Input Area */}
                <View style={styles.inputArea}>
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
                            messageText.trim() ? styles.sendButtonActive : null,
                        ]}
                        onPress={handleSend}
                    >
                        <Ionicons name="send" size={20} color="#ffffff" />
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
        color: "#00aeed",
        lineHeight: 16,
    },
    menuButton: {
        padding: 4,
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
    systemMessage: {
        alignSelf: "center",
        backgroundColor: "#f9fafb",
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
        maxWidth: "70%",
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
        backgroundColor: "#e6f7fd",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 8,
    },
    receivedBubble: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 16,
    },
    messageText: {
        fontSize: 16,
        fontWeight: "400",
        color: "#111827",
        lineHeight: 22,
    },
    linkText: {
        color: "#2563eb",
        textDecorationLine: "underline",
        fontWeight: "600",
    },
    messageTime: {
        fontSize: 12,
        fontWeight: "400",
        color: "#6b7280",
        marginHorizontal: 12,
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
});
