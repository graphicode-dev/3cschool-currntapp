import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import { DateSeparator } from "@/components/chat/DateSeparator";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette } from "@/constants/theme";
import { useGroupChats } from "@/hooks/useGroupChats";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";

export default function ChatConversationScreen() {
    const params = useLocalSearchParams<{
        groupId?: string;
        id?: string;
        groupName?: string;
        groupCapacity?: string;
    }>();

    const resolvedGroupId = params.groupId ?? params.id ?? "";
    const flatListRef = useRef<FlatList>(null);
    const { width } = useWindowDimensions();
    const responsivePaddingBottom = Math.round((width / 375) * 100);

    const {
        selectGroup,
        selectedGroup,
        messages,
        isLoading,
        isLoadingMessages,
        isSending,
        isLoadingMore,
        loadMoreMessages,
        sendMessage,
    } = useGroupChats();

    // Select the group when component mounts
    useEffect(() => {
        if (resolvedGroupId) {
            selectGroup(resolvedGroupId);
        }
    }, [resolvedGroupId, selectGroup]);

    const handleSendMessage = useCallback(
        async (text: string, imageUri?: string) => {
            await sendMessage(text, imageUri);
        },
        [sendMessage],
    );

    const handleLoadMore = useCallback(() => {
        loadMoreMessages();
    }, [loadMoreMessages]);

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

    if (isLoading || isLoadingMessages) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color={Palette.brand[500]}
                    />
                </View>
            </ScreenWrapper>
        );
    }

    if (!selectedGroup) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText>Chat not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgImage={Images.chatBg}>
            <CustomHeader
                title={params.groupName ?? selectedGroup.name ?? "Group Chat"}
                subtitle={
                    "Members: " +
                    (params.groupCapacity ??
                        String(selectedGroup.capacity) ??
                        "Capacity not available")
                }
                divider
                avatar={{
                    icon: (
                        <Icons.ChatIcon size={22} color={Palette.brand[500]} />
                    ),
                    size: 30,
                }}
                href="/(app)/(tabs)/chats"
            />

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
                                chatType="group"
                                showAvatar
                                showSenderName
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
                                    color={Palette.brand[500]}
                                />
                            </View>
                        ) : null
                    }
                    onScrollToIndexFailed={() => {}}
                />

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
    chat: { flex: 1 },
    list: { paddingVertical: 16 },
    inputWrap: { paddingBottom: 50, backgroundColor: "transparent" },
    loadingMore: { paddingVertical: 16, alignItems: "center" },
});
