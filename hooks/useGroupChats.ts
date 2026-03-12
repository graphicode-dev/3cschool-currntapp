import { useAuthStore } from "@/services/auth/auth.store";
import { groupsApi } from "@/services/groups/groups.api";
import { groupsKeys } from "@/services/groups/groups.keys";
import { useGroupChat, useGroupsList } from "@/services/groups/groups.queries";
import { Group, GroupMessage } from "@/services/groups/groups.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MappedChatMessage {
    id: string;
    text: string;
    sender: "me" | "user";
    createdAt: string;
    avatar?: string;
    senderName?: string;
    imageUri?: string;
    replyTo?: MappedChatMessage;
}

export interface MappedGroup {
    id: number;
    name: string;
    avatar?: string;
    lastMessage?: string;
    unreadCount: number;
    time: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toChatMessage = (msg: GroupMessage, myId: number): MappedChatMessage => ({
    id: String(msg.id),
    text: msg.message ?? "",
    sender: msg.sender_id === myId ? "me" : "user",
    createdAt: msg.created_at?.replace(" ", "T") ?? "",
    avatar: msg.sender?.avatar ?? undefined,
    senderName: msg.sender?.full_name,
    imageUri: msg.attachment_path
        ? `https://3cschool.net/storage/${msg.attachment_path}`
        : undefined,
});

const toTime = (timestamp: string | number) => {
    console.log("toTime input:", timestamp, typeof timestamp);

    // Handle both Unix timestamps and ISO strings
    let date: Date;

    if (typeof timestamp === "string") {
        // Check if string is actually a number (Unix timestamp as string)
        const numericValue = Number(timestamp);
        if (!isNaN(numericValue)) {
            // It's a numeric string, treat as Unix timestamp
            timestamp = numericValue;
        }
    }

    if (typeof timestamp === "number") {
        // Check if it's in seconds (Unix timestamp) or milliseconds
        if (timestamp < 10000000000) {
            // Assume it's seconds (Unix timestamp)
            console.log("Converting from Unix seconds:", timestamp);
            date = new Date(timestamp * 1000);
        } else {
            // Assume it's already milliseconds
            console.log("Using as milliseconds:", timestamp);
            date = new Date(timestamp);
        }
    } else {
        // Handle string input
        console.log("Parsing string date:", timestamp);
        date = new Date(timestamp);
    }

    console.log("Parsed date:", date, "isValid:", !isNaN(date.getTime()));

    // If date is invalid, return a fallback
    if (isNaN(date.getTime())) {
        console.log("Invalid date, returning empty string");
        return "";
    }

    const result = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    console.log("toTime output:", result);
    return result;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGroupChats = () => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<MappedChatMessage | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState("");

    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // ── Queries ───────────────────────────────────────────────────────────────

    const {
        data: groups = [],
        isLoading: groupsLoading,
        error: groupsError,
        refetch: refetchGroups,
    } = useGroupsList({});

    const {
        data: groupChatData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useGroupChat(selectedGroupId!, {
        enabled: !!selectedGroupId,
    });

    // ── Mutations ─────────────────────────────────────────────────────────────

    const sendMessageMutation = useMutation({
        mutationFn: ({ text, imageUri }: { text: string; imageUri?: string }) =>
            groupsApi.sendGroupChatMessage(selectedGroupId!, {
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
                queryKey: groupsKeys.groupChat(selectedGroupId!),
            });
        },
        onError: (error) => {
            console.error("Failed to send group message:", error);
        },
    });

    // ── Mapped data ───────────────────────────────────────────────────────────

    const mappedGroups: MappedGroup[] = useMemo(() => {
        return groups.map((group: Group) => ({
            id: group.id,
            name: group.name,
            avatar: group.teacher?.avatar || undefined,
            lastMessage: "No messages yet", // This would come from a separate API
            unreadCount: 0, // This would come from unread count API
            time: toTime(
                (group.updated_at || group.created_at || Date.now()).toString(),
            ),
        }));
    }, [groups]);

    const messages: MappedChatMessage[] = useMemo(() => {
        if (!groupChatData || !user) return [];

        try {
            // Handle both infinite query (data.pages) and regular query (data.data)
            const messagesData =
                "pages" in groupChatData
                    ? (groupChatData as any).pages
                          ?.flatMap((page: any) => page?.data || [])
                          .filter(Boolean) || []
                    : (groupChatData as any).data || [];

            return messagesData
                .filter((msg: any) => msg && msg.id)
                .sort(
                    (a: GroupMessage, b: GroupMessage) =>
                        new Date(
                            a.created_at?.replace(" ", "T") || "",
                        ).getTime() -
                        new Date(
                            b.created_at?.replace(" ", "T") || "",
                        ).getTime(),
                )
                .map((m: GroupMessage) => toChatMessage(m, user.id))
                .reverse();
        } catch (error) {
            console.error("Error processing messages:", error);
            return [];
        }
    }, [groupChatData, user]);

    const selectedGroup = useMemo(() => {
        if (!selectedGroupId) return null;
        return (
            mappedGroups.find((g) => g.id === Number(selectedGroupId)) || null
        );
    }, [selectedGroupId, mappedGroups]);

    const filteredGroups = useMemo(() => {
        const q = searchQuery.toLowerCase();
        if (!q) return mappedGroups;
        return mappedGroups.filter((group) =>
            group.name.toLowerCase().includes(q),
        );
    }, [mappedGroups, searchQuery]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const selectGroup = useCallback(
        async (groupId: string | number) => {
            const groupIdStr = String(groupId);

            // Clear first so React sees a state change
            setSelectedGroupId(null);
            setReplyingTo(null);

            // Remove cached data so the query starts fresh
            await queryClient.removeQueries({
                queryKey: groupsKeys.groupChat(groupIdStr),
            });

            // Set the ID in next microtask
            queueMicrotask(() => {
                setSelectedGroupId(groupIdStr);
            });
        },
        [queryClient],
    );

    const clearSelection = useCallback(() => {
        setSelectedGroupId(null);
        setReplyingTo(null);
    }, []);

    const sendMessage = useCallback(
        async (text: string, imageUri?: string) => {
            if (!selectedGroupId || (!text.trim() && !imageUri)) return;

            try {
                await sendMessageMutation.mutateAsync({ text, imageUri });
                setReplyingTo(null);
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        },
        [selectedGroupId, sendMessageMutation],
    );

    const loadMoreMessages = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return {
        // Data
        groups: mappedGroups,
        filteredGroups,
        selectedGroup,
        messages,
        selectedGroupId,

        // Loading states
        isLoading: groupsLoading,
        isLoadingMessages: false, // This would come from the query
        isSending: sendMessageMutation.isPending,
        isLoadingMore: isFetchingNextPage,

        // Error handling
        error: (groupsError as Error | null)?.message ?? null,

        // Search
        searchQuery,
        setSearchQuery,

        // Reply functionality
        replyingTo,
        setReplyingTo,

        // Actions
        selectGroup,
        clearSelection,
        sendMessage,
        loadMoreMessages,
        refetch: refetchGroups,
    };
};
