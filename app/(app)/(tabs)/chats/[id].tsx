import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette } from "@/constants/theme";
import { useGroupChats } from "@/hooks/useGroupChats";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function ChatConversationScreen() {
    const params = useLocalSearchParams<{
        groupId?: string;
        id?: string;
        groupName?: string;
    }>();

    const resolvedGroupId = params.groupId ?? params.id ?? "";
    const flatListRef = useRef<FlatList>(null);

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
                divider
                avatar={{
                    icon: (
                        <Icons.ChatIcon size={22} color={Palette.brand[500]} />
                    ),
                    size: 30,
                }}
                href="/(app)/(tabs)/chats"
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
                    />
                )}
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
    chat: { flex: 1 },
    list: { paddingVertical: 16 },
    inputWrap: { paddingBottom: 50, backgroundColor: "transparent" },
    loadingMore: { paddingVertical: 16, alignItems: "center" },
});
