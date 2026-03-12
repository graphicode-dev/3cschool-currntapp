import { ChatListItem } from "@/components/chat/ChatListItem";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { Error } from "@/components/ui/Error";
import { Loading } from "@/components/ui/Loading";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Palette, Radii, Spacing } from "@/constants/theme";
import { useGroupChats } from "@/hooks/useGroupChats";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";

const ChatListScreen = () => {
    const {
        groups,
        filteredGroups,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        refetch,
    } = useGroupChats();

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

    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <ScreenWrapper>
            <PullToRefreshScrollView
                refetches={[() => refetch()]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.listHeader}>
                    <View>
                        <ThemedText style={styles.listTitle}>
                            Conversations
                        </ThemedText>
                        <ThemedText style={styles.listSubtitle}>
                            {groups.length} Chats
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.searchWrap}>
                    <ThemedText style={styles.searchIcon}>🔍</ThemedText>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Conversations"
                        placeholderTextColor={Palette.slate400}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={filteredGroups}
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
                        <View style={styles.empty}>
                            <ThemedText style={styles.emptyIcon}>💬</ThemedText>
                            <ThemedText style={styles.emptyTitle}>
                                No Conversations Yet
                            </ThemedText>
                        </View>
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
        fontSize: 24,
        fontWeight: "700",
        color: Palette.slate700,
    },
    listSubtitle: {
        fontSize: 12,
        color: Palette.slate400,
        marginTop: 2,
    },
    searchWrap: {
        flexDirection: "row",
        alignItems: "center",
        margin: 16,
        backgroundColor: Palette.slate50,
        borderRadius: Radii.xl,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
    },
    searchIcon: { fontSize: 14 },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: Palette.slate700,
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
    emptyIcon: { fontSize: 36, marginBottom: 4 },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Palette.slate600,
    },
    emptyText: {
        fontSize: 13,
        color: Palette.slate400,
        textAlign: "center",
    },
});
