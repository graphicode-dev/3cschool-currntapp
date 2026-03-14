import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import { DateSeparator } from "@/components/chat/DateSeparator";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Images } from "@/constants/images";
import { useTicketChat } from "@/hooks/useTicketChat";
import { useCloseTicket } from "@/services/tickets/tickets.mutations";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

export default function TicketChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const flatListRef = useRef<FlatList>(null);
    const { width } = useWindowDimensions();
    const scaleFont = (size: number) => Math.round((width / 375) * size);
    const responsivePaddingBottom = Math.round((width / 375) * 100);

    const {
        selectTicket,
        selectedTicket,
        messages,
        isLoading,
        isLoadingTicket,
        isSending,
        sendMessage,
        ticketError,
        error,
    } = useTicketChat();

    const closeTicket = useCloseTicket();

    // Select the ticket when component mounts
    useEffect(() => {
        if (id) {
            selectTicket(id);
        }
    }, [id, selectTicket]);

    const handleSendMessage = useCallback(
        async (text: string, attachmentUri?: string, fileName?: string) => {
            await sendMessage(text, attachmentUri);
        },
        [sendMessage],
    );

    const handleLoadMore = useCallback(() => {
        // Support tickets don't typically have pagination for messages
        // This is a placeholder function
    }, []);

    const isLoadingMore = false; // Support tickets don't have loading more state

    const handleCloseTicket = useCallback(() => {
        Alert.alert(
            "Close Ticket",
            "Are you sure you want to close this ticket? You won't be able to send more messages.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Close Ticket",
                    style: "destructive",
                    onPress: () => {
                        if (id) {
                            closeTicket.mutate(id);
                        }
                    },
                },
            ],
        );
    }, [id, closeTicket]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }
    }, [messages.length]);

    // Process messages to add date separators
    const messagesWithDates = useMemo(() => {
        if (messages.length === 0) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const processed: { type: "message" | "date"; data: any }[] = [];
        let lastDate: Date | null = null;

        // Process messages in reverse order (since FlatList is inverted)
        const reversedMessages = [...messages].reverse();

        reversedMessages.forEach((message) => {
            const messageDate = new Date(message.createdAt);
            messageDate.setHours(0, 0, 0, 0);

            // Check if we need to add a date separator
            if (!lastDate || messageDate.getTime() !== lastDate.getTime()) {
                const isToday = messageDate.getTime() === today.getTime();
                const isYesterday =
                    messageDate.getTime() === yesterday.getTime();

                processed.push({
                    type: "date",
                    data: {
                        date: message.createdAt,
                        isToday,
                        isYesterday,
                    },
                });

                lastDate = messageDate;
            }

            processed.push({
                type: "message",
                data: message,
            });
        });

        return processed.reverse();
    }, [messages]);

    if (isLoading || isLoadingTicket) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1890FF" />
                </View>
            </ScreenWrapper>
        );
    }

    // Show general error if there's one
    if (error) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText
                        style={[styles.errorText]}
                        fontSize={scaleFont(16)}
                    >
                        Something went wrong
                    </ThemedText>
                    <ThemedText
                        style={[styles.errorSubText]}
                        fontSize={scaleFont(14)}
                    >
                        {error}
                    </ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    // Show error if there's a ticket-specific error
    if (ticketError) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText
                        style={[styles.errorText]}
                        fontSize={scaleFont(16)}
                    >
                        Error loading ticket
                    </ThemedText>
                    <ThemedText
                        style={[styles.errorSubText]}
                        fontSize={scaleFont(14)}
                    >
                        {ticketError}
                    </ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!selectedTicket) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText>Ticket not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    const headerTitle = selectedTicket.title;
    const isTicketClosed = selectedTicket.status === "closed";

    return (
        <ScreenWrapper bgImage={Images.chatBg}>
            <CustomHeader
                title={headerTitle}
                divider
                avatar={{
                    name: selectedTicket.avatar || "S",
                    image: selectedTicket.avatar,
                    size: 30,
                }}
                href="/(app)/(tabs)/support"
            />

            {!isTicketClosed && (
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleCloseTicket}
                    disabled={closeTicket.isPending}
                >
                    {closeTicket.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <View style={styles.closeButtonWrapper}>
                            <ThemedText
                                style={[styles.closeButtonText]}
                                fontSize={scaleFont(10)}
                            >
                                Close Ticket
                            </ThemedText>
                        </View>
                    )}
                </TouchableOpacity>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <FlatList
                    ref={flatListRef}
                    data={messagesWithDates}
                    inverted
                    keyExtractor={(item, index) =>
                        item.type === "date" ? `date-${index}` : item.data.id
                    }
                    renderItem={({ item }) => {
                        if (item.type === "date") {
                            return (
                                <DateSeparator
                                    date={item.data.date}
                                    isToday={item.data.isToday}
                                    isYesterday={item.data.isYesterday}
                                />
                            );
                        }

                        return (
                            <ChatBubble
                                message={item.data}
                                chatType="private"
                            />
                        );
                    }}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    style={styles.chat}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <View style={styles.loadingMore}>
                                <ActivityIndicator
                                    size="small"
                                    color="#1890FF"
                                />
                            </View>
                        ) : null
                    }
                    onScrollToIndexFailed={() => {}}
                />

                {isTicketClosed ? (
                    <View style={styles.closedBanner}>
                        <ThemedText
                            style={[styles.closedText]}
                            fontSize={scaleFont(14)}
                        >
                            ✅ This ticket has been closed
                        </ThemedText>
                    </View>
                ) : (
                    <View
                        style={[
                            styles.inputWrap,
                            { paddingBottom: responsivePaddingBottom },
                        ]}
                    >
                        <ChatInput
                            onSend={handleSendMessage}
                            isSending={isSending}
                        />
                    </View>
                )}
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    errorText: {
        color: "#ff4444",
        fontWeight: "600",
        marginBottom: 8,
    },
    errorSubText: {
        color: "#666",
        textAlign: "center",
        paddingHorizontal: 32,
    },
    chat: { flex: 1 },
    list: { paddingVertical: 16 },
    inputWrap: { paddingBottom: 50, backgroundColor: "transparent" },
    closeButton: {
        position: "absolute",
        top: 60,
        right: 20,
        backgroundColor: "#ff4444",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        zIndex: 10,
    },
    closeButtonWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "600",
    },
    closedBanner: {
        backgroundColor: "#f0f9ff",
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 70,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#e6f7ff",
    },
    closedText: {
        color: "#52c41a",
        fontWeight: "500",
    },
    loadingMore: { paddingVertical: 16, alignItems: "center" },
});
