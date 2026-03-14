import { ChatListItem } from "@/components/chat/ChatListItem";
import { GroupsSearch } from "@/components/groups/groups-search";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Error } from "@/components/ui/Error";
import { Loading } from "@/components/ui/Loading";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Palette, Spacing } from "@/constants/theme";
import { useGroupChats } from "@/hooks/useGroupChats";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

const ChatListScreen = () => {
    const { groups, isLoading, error, searchQuery, setSearchQuery, refetch } =
        useGroupChats();

    const handleChatPress = (group: any) => {
        router.push({
            pathname: "/(app)/(tabs)/chats/[id]",
            params: {
                id: String(group.id),
                groupId: String(group.id),
                groupName: group.name,
            },
        });
    };

    // if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <ScreenWrapper>
            <PullToRefreshScrollView
                refetches={[() => refetch()]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.listHeader}>
                    <View>
                        <ThemedText style={styles.listTitle} fontSize={24}>
                            Conversations
                        </ThemedText>
                        <ThemedText style={styles.listSubtitle} fontSize={12}>
                            {groups.length} Chats
                        </ThemedText>
                    </View>
                </View>

                {/* Search */}
                <GroupsSearch
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <FlatList
                    data={isLoading ? [] : groups}
                    keyExtractor={(c) => c.id.toString()}
                    renderItem={({ item }) => (
                        <ChatListItem
                            chat={item}
                            isSelected={false}
                            onClick={handleChatPress}
                        />
                    )}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        isLoading ? (
                            <Loading />
                        ) : (
                            <View style={styles.empty}>
                                <ThemedText
                                    style={styles.emptyIcon}
                                    fontSize={36}>
                                    💬
                                </ThemedText>
                                <ThemedText
                                    style={styles.emptyTitle}
                                    fontSize={16}>
                                    No Conversations Yet
                                </ThemedText>
                            </View>
                        )
                    }
                />
            </PullToRefreshScrollView>
        </ScreenWrapper>
    );
};

export default ChatListScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Spacing.lg,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    listHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Palette.slate100,
    },
    listTitle: {
        fontWeight: "700",
        color: Palette.slate700,
    },
    listSubtitle: {
        color: Palette.slate400,
        marginTop: 2,
    },
    list: {
        flex: 1,
        paddingBottom: 50,
    },
    empty: {
        padding: 48,
        alignItems: "center",
        gap: 8,
    },
    emptyIcon: { marginBottom: 4 },
    emptyTitle: {
        fontWeight: "700",
        color: Palette.slate600,
    },
});
