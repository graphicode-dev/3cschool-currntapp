import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Images } from "@/constants/images";
import { useAuthStore } from "@/services/auth/auth.store";
import { ChatMessage } from "@/services/chats/chat.types";
import { useSendTicketMessage } from "@/services/tickets/tickets.mutations";
import { useTicket } from "@/services/tickets/tickets.queries";
import { TicketMessage } from "@/services/tickets/tickets.types";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

// ─── Map API message → ChatMessage ───────────────────────────────────────────

function toChat(msg: TicketMessage, myId: number): ChatMessage {
    return {
        id: String(msg.id),
        text: msg.message ?? "",
        sender: msg.sender_id === myId ? "me" : "instructor",
        createdAt: new Date(msg.created_at * 1000).toISOString(),
        avatar: msg.sender?.avatar ?? undefined,
        senderName: msg.sender?.full_name,
        imageUri: msg.attachment ?? undefined,
    };
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TicketChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuthStore();
    const flatListRef = useRef<FlatList>(null);

    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | undefined>();

    const { data: ticket, refetch } = useTicket(id, { enabled: !!id });
    const { mutate: sendMsg, isPending } = useSendTicketMessage(id);

    // newest-first for inverted FlatList
    const messages: ChatMessage[] = useMemo(() => {
        if (!ticket?.messages || !user) return [];
        return [...ticket.messages]
            .sort((a, b) => a.created_at - b.created_at)
            .map((m) => toChat(m, user.id))
            .reverse();
    }, [ticket?.messages, user?.id]);

    // Always scroll to bottom (index 0 in inverted list) when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
    }, [messages.length]);

    const handleSend = useCallback(
        (text: string, imageUri?: string) => {
            if (!text && !imageUri) return;
            sendMsg(
                { message: text || undefined, attachmentUri: imageUri },
                { onSuccess: () => refetch() },
            );
            setReplyTo(null);
        },
        [sendMsg, refetch],
    );

    const handleNavigateToMessage = useCallback(
        (messageId: string) => {
            const index = messages.findIndex((m) => m.id === messageId);
            if (index !== -1) {
                flatListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.5,
                });
                setHighlightedId(messageId);
                setTimeout(() => setHighlightedId(undefined), 2000);
            }
        },
        [messages],
    );

    const headerTitle = ticket?.title ?? "Ticket";

    return (
        <ScreenWrapper bgImage={Images.chatBg}>
            <CustomHeader
                title={headerTitle}
                divider
                avatar={{
                    name: ticket?.instructor?.full_name ?? "S",
                    image: ticket?.instructor?.avatar ?? undefined,
                    size: 30,
                }}
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
                        onReply={setReplyTo}
                        onNavigateToMessage={handleNavigateToMessage}
                        highlightedMessageId={highlightedId}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                style={styles.chat}
                onScrollToIndexFailed={() => {}}
            />

            <View style={styles.inputWrap}>
                <ChatInput
                    onSend={handleSend}
                    replyTo={replyTo}
                    onClearReply={() => setReplyTo(null)}
                    isSending={isPending}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    chat: { flex: 1 },
    list: { paddingVertical: 16 },
    inputWrap: { paddingBottom: 50, backgroundColor: "transparent" },
});
