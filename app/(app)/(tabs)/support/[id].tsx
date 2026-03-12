import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Images } from "@/constants/images";
import { useTicketChat } from "@/hooks/useTicketChat";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function TicketChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const flatListRef = useRef<FlatList>(null);

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

    // Select the ticket when component mounts
    useEffect(() => {
        if (id) {
            selectTicket(id);
        }
    }, [id, selectTicket]);

    const handleSendMessage = useCallback(
        async (text: string, imageUri?: string) => {
            await sendMessage(text, imageUri);
        },
        [sendMessage],
    );

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }
    }, [messages.length]);

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
                    <ThemedText style={styles.errorText}>
                        Something went wrong
                    </ThemedText>
                    <ThemedText style={styles.errorSubText}>{error}</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    // Show error if there's a ticket-specific error
    if (ticketError) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText style={styles.errorText}>
                        Error loading ticket
                    </ThemedText>
                    <ThemedText style={styles.errorSubText}>
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

            <FlatList
                ref={flatListRef}
                data={messages}
                inverted
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatBubble
                        message={item}
                        chatType="private"
                        showAvatar
                        showSenderName={false}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                style={styles.chat}
                onScrollToIndexFailed={() => {}}
            />

            <View style={styles.inputWrap}>
                <ChatInput onSend={handleSendMessage} isSending={isSending} />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    errorText: {
        fontSize: 16,
        color: "#ff4444",
        fontWeight: "600",
        marginBottom: 8,
    },
    errorSubText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        paddingHorizontal: 32,
    },
    chat: { flex: 1 },
    list: { paddingVertical: 16 },
    inputWrap: { paddingBottom: 50, backgroundColor: "transparent" },
});
