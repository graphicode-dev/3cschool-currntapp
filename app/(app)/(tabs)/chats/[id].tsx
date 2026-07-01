import Avatar from "@/components/avatar";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import { DateSeparator } from "@/components/chat/DateSeparator";
import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useGroupChats } from "@/hooks/useGroupChats";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

export default function ChatConversationScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{
    groupId?: string;
    id?: string;
    groupName?: string;
    groupCapacity?: string;
  }>();

  const resolvedGroupId = params.groupId ?? params.id ?? "";
  const flatListRef = useRef<FlatList>(null);
  const { width, height } = useWindowDimensions();
  const shortDimension = Math.min(width, height);
  const scaleFactor = Math.min(shortDimension / 375, 1.25);
  const responsivePaddingBottom = Math.round(scaleFactor * 100);

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
    students,
    studentsCount,
    isLoadingStudents,
  } = useGroupChats();

  const [showStudentsModal, setShowStudentsModal] = useState(false);

  // Select the group when component mounts
  useEffect(() => {
    if (resolvedGroupId) {
      selectGroup(resolvedGroupId);
    }
  }, [resolvedGroupId, selectGroup]);

  const handleSendMessage = useCallback(
    async (text: string, attachmentUri?: string, fileName?: string) => {
      await sendMessage(text, attachmentUri);
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
        const isYesterday = messageDate.getTime() === yesterday.getTime();

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
          <ActivityIndicator size="large" color={Palette.brand[500]} />
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
        title={
          params.groupName ??
          selectedGroup.name ??
          t("chats.conversation.title")
        }
        subtitle={
          t("chats.conversation.members") +
          ": " +
          (params.groupCapacity ??
            String(selectedGroup.capacity) ??
            t("chats.conversation.capacityNotAvailable"))
        }
        divider
        avatar={{
          icon: <Icons.ChatIcon size={22} color={Palette.brand[500]} />,
          size: 30,
        }}
        href="/(app)/(tabs)/chats"
        rightAction={
          <TouchableOpacity
            onPress={() => setShowStudentsModal(true)}
            style={styles.headerButton}
          >
            <Icons.UsersIcon size={22} color={Palette.brand[500]} />
          </TouchableOpacity>
        }
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
                <ActivityIndicator size="small" color={Palette.brand[500]} />
              </View>
            ) : null
          }
          onScrollToIndexFailed={() => {}}
        />

        <View
          style={[styles.inputWrap, { paddingBottom: responsivePaddingBottom }]}
        >
          <ChatInput onSend={handleSendMessage} isSending={isSending} />
        </View>
      </KeyboardAvoidingView>
      <Modal
        animationType="slide"
        transparent
        visible={showStudentsModal}
        onRequestClose={() => setShowStudentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText
                style={styles.modalTitle}
                fontSize={18}
                fontWeight="bold"
              >
                {t("chats.conversation.students")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowStudentsModal(false)}
                style={styles.closeButton}
              >
                <Icons.XIcon size={20} color={Palette.slate500} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.modalSubtitle} fontSize={12}>
              {studentsCount} {t("chats.conversation.members")}
            </ThemedText>
            {isLoadingStudents ? (
              <ActivityIndicator
                style={styles.modalLoading}
                color={Palette.brand[500]}
              />
            ) : (
              <FlatList
                data={students}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.studentItem}>
                    <Avatar
                      image={item.avatar ?? undefined}
                      name={item.full_name}
                      size={40}
                    />
                    <View style={styles.studentInfo}>
                      <ThemedText fontSize={14} fontWeight="bold">
                        {item.full_name}
                      </ThemedText>
                      <ThemedText style={styles.studentRole} fontSize={11}>
                        {item.email}
                      </ThemedText>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyStudents}>
                    <ThemedText fontSize={14}>
                      {t("chats.conversation.noStudents")}
                    </ThemedText>
                  </View>
                }
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
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
  headerButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Palette.brand[50],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: {
    color: Palette.brand[500],
  },
  modalSubtitle: {
    color: Palette.slate500,
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalLoading: {
    marginTop: 24,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.brand[100],
  },
  studentInfo: {
    flexDirection: "column",
    gap: 2,
  },
  studentRole: {
    color: Palette.slate500,
  },
  emptyStudents: {
    alignItems: "center",
    marginTop: 24,
  },
});
