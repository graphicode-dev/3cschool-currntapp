import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette } from "@/constants/theme";
import { useAuthStore } from "@/services/auth/auth.store";
import { ChatMessage } from "@/services/chats/chat.types";
import { groupsApi } from "@/services/groups/groups.api";
import { groupsKeys } from "@/services/groups/groups.keys";
import { useGroupChat } from "@/services/groups/groups.queries";
import { GroupMessage } from "@/services/groups/groups.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

function toChat(msg: GroupMessage, myId: number): ChatMessage {
    return {
        id: String(msg.id),
        text: msg.message ?? "",
        sender: msg.sender_id === myId ? "me" : "user",
        createdAt: msg.created_at?.replace(" ", "T") ?? "",
        avatar: msg.sender?.avatar ?? undefined,
        senderName: msg.sender?.full_name,
        imageUri: msg.attachment_path
            ? `https://3cschool.net/storage/${msg.attachment_path}`
            : undefined,
    };
}

export default function GroupChatScreen() {
    const params = useLocalSearchParams<{
        groupId?: string;
        id?: string;
        groupName?: string;
    }>();

    const resolvedGroupId = params.groupId ?? params.id ?? "";
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const flatListRef = useRef<FlatList>(null);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | undefined>();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useGroupChat(resolvedGroupId, { enabled: !!resolvedGroupId });

    const { mutate: sendMsg, isPending } = useMutation({
        mutationFn: ({ text, imageUri }: { text: string; imageUri?: string }) =>
            groupsApi.sendGroupChatMessage(resolvedGroupId, {
                message: text,
                attachment: imageUri
                    ? ({
                          uri: imageUri,
                          name: "photo.jpg",
                          type: "image/jpeg",
                      } as any)
                    : undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: groupsKeys.groupChat(resolvedGroupId),
            });
            refetch();
        },
        onError: (error) => {
            console.error("Failed to send group message:", error);
            // You could show a toast or alert here
        },
    });

    // Flatten all pages → sort chronologically → reverse for inverted FlatList
    const messages: ChatMessage[] = useMemo(() => {
        if (!data || !user) return [];

        try {
            // Handle both infinite query (data.pages) and regular query (data.data)
            const messagesData =
                "pages" in data
                    ? (data as any).pages
                          ?.flatMap((page: any) => page?.data || [])
                          .filter(Boolean) || []
                    : (data as any).data || [];

            return messagesData
                .filter((msg: any) => msg && msg.id) // Filter out invalid messages
                .sort(
                    (a: GroupMessage, b: GroupMessage) =>
                        new Date(
                            a.created_at?.replace(" ", "T") || "",
                        ).getTime() -
                        new Date(
                            b.created_at?.replace(" ", "T") || "",
                        ).getTime(),
                )
                .map((m: GroupMessage) => toChat(m, user.id))
                .reverse();
        } catch (error) {
            console.error("Error processing messages:", error);
            return [];
        }
    }, [data, user?.id]);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }
    }, [messages.length]);

    const handleSend = useCallback(
        (text: string, imageUri?: string) => {
            if (!text.trim() && !imageUri) return;
            sendMsg({ text, imageUri });
            setReplyTo(null);
        },
        [sendMsg],
    );

    const handleNavigate = useCallback(
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

    // inverted list: onEndReached = scrolled to top = load older messages
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <ScreenWrapper bgImage={Images.chatBg}>
            <CustomHeader
                title={params.groupName ?? "Group Chat"}
                divider
                avatar={{
                    icon: (
                        <Icons.ChatIcon size={22} color={Palette.brand[500]} />
                    ),
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
                        chatType="group"
                        showAvatar
                        showSenderName
                        onReply={setReplyTo}
                        onNavigateToMessage={handleNavigate}
                        highlightedMessageId={highlightedId}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                style={styles.chat}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.loadingMore}>
                            <ActivityIndicator
                                size="small"
                                color={Palette.brand[500]}
                            />
                        </View>
                    ) : null
                }
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
    loadingMore: { paddingVertical: 16, alignItems: "center" },
});
