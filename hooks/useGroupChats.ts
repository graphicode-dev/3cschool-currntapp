import { useAuthStore } from "@/services/auth/auth.store";
import { groupsApi } from "@/services/groups/groups.api";
import { groupsKeys } from "@/services/groups/groups.keys";
import { useGroupChat, useGroupsList } from "@/services/groups/groups.queries";
import { GroupMessage, LastGroupMessage } from "@/services/groups/groups.types";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MappedChatMessage {
    id: string;
    text: string;
    sender: "me" | "user";
    createdAt: string;
    avatar?: string;
    senderName?: string;
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    replyTo?: MappedChatMessage;
}

export interface MappedGroup {
    id: number;
    name: string;
    avatar?: string;
    thumbnail?: string;
    lastMessage?: LastGroupMessage;
    unreadCount: number;
    time: string;
    courseTitle?: string;
    capacity?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toChatMessage = (msg: GroupMessage, myId: number): MappedChatMessage => ({
    id: String(msg.id),
    text: msg.message ?? "",
    sender: msg.sender_id === myId ? "me" : "user",
    createdAt: msg.created_at?.replace(" ", "T") ?? "",
    avatar: msg.sender?.avatar ?? undefined,
    senderName: msg.sender?.full_name,
    imageUrl: msg.attachment_url ? msg.attachment_url : undefined,
    fileUrl:
        msg.attachment_url &&
        !msg.attachment_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            ? msg.attachment_url
            : undefined,
    fileName:
        msg.attachment_name ||
        (msg.attachment_url &&
        !msg.attachment_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            ? msg.attachment_url.split("/").pop()?.split("?")[0]
            : undefined),
});

const toTime = (timestamp: string | number) => {
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
            date = new Date(timestamp * 1000);
        } else {
            // Assume it's already milliseconds
            date = new Date(timestamp);
        }
    } else {
        // Handle string input
        date = new Date(timestamp);
    }

    // If date is invalid, return a fallback
    if (isNaN(date.getTime())) {
        console.error("Invalid date, returning empty string");
        return "";
    }

    const result = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return result;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGroupChats = () => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Debounced search value to avoid excessive API calls
    const debouncedSearch = useDebounce(searchQuery, 500);

    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // ── Queries ───────────────────────────────────────────────────────────────

    const {
        data: groups = [],
        isLoading: groupsLoading,
        error: groupsError,
        refetch: refetchGroups,
    } = useGroupsList({ search: debouncedSearch });

    const {
        data: groupChatData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useGroupChat(selectedGroupId!, {
        enabled: !!selectedGroupId,
    });

    // ── Polling on screen focus ───────────────────────────────────────────────

    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
        null,
    );

    useFocusEffect(
        useCallback(() => {
            if (!selectedGroupId) return;

            // Start polling when screen becomes focused
            pollingIntervalRef.current = setInterval(() => {
                refetch();
            }, 1000 * 10); // Poll every 10 seconds

            // Cleanup on blur
            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
            };
        }, [selectedGroupId, refetch]),
    );

    // ── Mutations ─────────────────────────────────────────────────────────────

    const sendMessageMutation = useMutation({
        mutationFn: ({
            text,
            attachmentUri,
            fileName,
        }: {
            text: string;
            attachmentUri?: string;
            fileName?: string;
        }) =>
            groupsApi.sendGroupChatMessage(selectedGroupId!, {
                message: text,
                attachment: attachmentUri
                    ? ({
                          uri: attachmentUri,
                          name: fileName || "file",
                          type:
                              fileName?.endsWith(".jpg") ||
                              fileName?.endsWith(".jpeg") ||
                              fileName?.endsWith(".png")
                                  ? "image/jpeg"
                                  : "application/octet-stream",
                      } as any)
                    : undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: groupsKeys.groupChat(selectedGroupId!),
            });
            // Immediately refetch messages after sending
            refetch();
        },
        onError: (error) => {
            console.error("Failed to send group message:", error);
        },
    });

    // ── Mapped data ───────────────────────────────────────────────────────────

    const mappedGroups = useMemo(() => {
        return groups.map((group) => ({
            id: group.id,
            name: group.name,
            courseTitle: group.course?.title,
            capacity: group.course?.capacity ?? undefined,
            avatar: group.teacher?.avatar || undefined,
            thumbnail: group.course?.thumbnail
                ? group.course?.thumbnail
                : undefined,
            lastMessage: group.last_message || undefined,
            unreadCount: group.unread_count || 0,
            time: toTime(group.last_message?.created_at || ""),
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

    // ── Handlers ──────────────────────────────────────────────────────────────

    const selectGroup = useCallback(
        async (groupId: string | number) => {
            const groupIdStr = String(groupId);

            // Clear first so React sees a state change
            setSelectedGroupId(null);

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
    }, []);

    const sendMessage = useCallback(
        async (text: string, attachmentUri?: string, fileName?: string) => {
            if (!selectedGroupId || (!text.trim() && !attachmentUri)) return;

            try {
                await sendMessageMutation.mutateAsync({
                    text,
                    attachmentUri,
                    fileName,
                });
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

        // Actions
        selectGroup,
        clearSelection,
        sendMessage,
        loadMoreMessages,
        refetch: refetchGroups,
    };
};
