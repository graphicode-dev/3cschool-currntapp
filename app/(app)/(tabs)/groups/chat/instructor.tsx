import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Images } from "@/constants/images";
import { Palette } from "@/constants/theme";
import { useAuthStore } from "@/services/auth/auth.store";
import { ChatMessage } from "@/services/chats/chat.types";
import { groupsApi } from "@/services/groups/groups.api";
import { groupsKeys } from "@/services/groups/groups.keys";
import { useGroup, usePrivateMessages } from "@/services/groups/groups.queries";
import { GroupMessage } from "@/services/groups/groups.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

function toChat(msg: GroupMessage, myId: number): ChatMessage {
    return {
        id: String(msg.id),
        text: msg.message ?? "",
        sender: msg.sender_id === myId ? "me" : "instructor",
        createdAt: msg.created_at?.replace(" ", "T") ?? "",
        avatar: msg.sender?.avatar ?? undefined,
        senderName: msg.sender?.full_name,
        imageUri:
            (msg as any).attachment_url || msg.attachment_path
                ? `https://3cschool.net/storage/${(msg as any).attachment_url || msg.attachment_path}`
                : undefined,
    };
}

export default function InstructorChatScreen() {
    const params = useLocalSearchParams<{
        groupId?: string;
        id?: string;
        instructorName?: string;
        instructorAvatar?: string;
    }>();

    const resolvedGroupId = params.groupId ?? params.id ?? "";
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const flatListRef = useRef<FlatList>(null);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | undefined>();

    const { data: groupDetail, isLoading: groupLoading } = useGroup(
        resolvedGroupId,
        { enabled: !!resolvedGroupId },
    );

    const instructorId = groupDetail?.teacher?.id;
    const instructorName =
        params.instructorName ??
        groupDetail?.teacher?.full_name ??
        "Instructor";
    const instructorAvatar =
        params.instructorAvatar ?? groupDetail?.teacher?.avatar ?? undefined;

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        usePrivateMessages(resolvedGroupId, instructorId ?? "", {
            enabled: !!resolvedGroupId && !!instructorId,
        });

    const { mutate: sendMsg, isPending } = useMutation({
        mutationFn: ({
            text,
            imageUri,
        }: {
            text: string;
            imageUri?: string;
        }) => {
            console.log("🚀 Sending instructor message:", {
                text,
                imageUri,
                resolvedGroupId,
                instructorId,
            });
            return groupsApi.sendPrivateMessage(
                resolvedGroupId,
                instructorId!,
                {
                    message: text,
                    attachment: imageUri
                        ? ({
                              uri: imageUri,
                              name: "photo.jpg",
                              mimeType: "image/jpeg",
                          } as any)
                        : undefined,
                },
            );
        },
        onSuccess: (data) => {
            console.log("✅ Message sent successfully, adding to cache:", data);
            // Add the new message to the first page of the infinite query
            queryClient.setQueryData(
                groupsKeys.privateMessagesList(resolvedGroupId, instructorId!),
                (oldData: any) => {
                    if (!oldData || !oldData.pages || !oldData.pages[0])
                        return oldData;

                    // Create new first page with the new message
                    const newFirstPage = {
                        ...oldData.pages[0],
                        data: [data, ...(oldData.pages[0].data || [])],
                    };

                    return {
                        ...oldData,
                        pages: [newFirstPage, ...oldData.pages.slice(1)],
                    };
                },
            );
        },
        onError: (error) => {
            console.error("❌ Failed to send message:", error);
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
                          ?.flatMap((page: any) => {
                              // Page is the array of messages directly, not wrapped in a data property
                              return Array.isArray(page)
                                  ? page
                                  : page?.data || [];
                          })
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
            console.error("Error processing instructor messages:", error);
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
                title={instructorName}
                divider
                avatar={{
                    name: instructorName,
                    image: instructorAvatar,
                    size: 30,
                }}
            />

            {groupLoading && !instructorId ? (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size="large"
                        color={Palette.brand[500]}
                    />
                </View>
            ) : (
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
            )}

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
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingMore: { paddingVertical: 16, alignItems: "center" },
});
