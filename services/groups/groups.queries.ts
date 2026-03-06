import {
    useInfiniteQuery,
    useQuery,
    type UseInfiniteQueryOptions,
    type UseQueryOptions,
} from "@tanstack/react-query";
import { groupsApi } from "./groups.api";
import { groupsKeys } from "./groups.keys";
import type {
    Group,
    GroupChatPage,
    GroupDetail,
    UnreadMessagesResponse,
} from "./groups.types";

// ─── Standard queries ─────────────────────────────────────────────────────────

export function useGroupsList(
    params?: { search?: string; filter?: string },
    options?: Partial<UseQueryOptions<Group[], Error>>,
) {
    return useQuery({
        queryKey: groupsKeys.list(params),
        queryFn: ({ signal }) => groupsApi.getList(params, signal),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useGroup(
    id: string | number,
    options?: Partial<UseQueryOptions<GroupDetail, Error>>,
) {
    return useQuery({
        queryKey: groupsKeys.detail(id),
        queryFn: ({ signal }) => groupsApi.getById(id, signal),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useUnreadMessages(
    options?: Partial<UseQueryOptions<UnreadMessagesResponse, Error>>,
) {
    return useQuery({
        queryKey: groupsKeys.unread(),
        queryFn: ({ signal }) => groupsApi.getUnreadMessages(signal),
        staleTime: 1000 * 60 * 2,
        refetchInterval: 1000 * 60,
        ...options,
    });
}

// ─── Infinite queries (paginated chat) ───────────────────────────────────────

/**
 * Infinite scroll hook for group chat.
 *
 * Pages are fetched oldest-first (page 1 = oldest).
 * UI shows messages newest-first using an inverted FlatList.
 * Call fetchNextPage() when the user scrolls to the top (which is the
 * bottom of the inverted list) to load older messages.
 */
export function useGroupChat(
    groupId: string | number,
    options?: Partial<UseInfiniteQueryOptions<GroupChatPage, Error>>,
) {
    return useInfiniteQuery({
        queryKey: groupsKeys.groupChat(groupId),
        queryFn: ({ pageParam = 1, signal }) =>
            groupsApi.getGroupChat(groupId, pageParam as number, signal),
        getNextPageParam: (lastPage) => {
            if (!lastPage?.pagination) return undefined;
            const { current_page, last_page } = lastPage.pagination;
            return current_page < last_page ? current_page + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!groupId,
        staleTime: 1000 * 60,
        refetchInterval: 1000 * 30,
        ...options,
    });
}

/**
 * Infinite scroll hook for private (instructor) messages.
 *
 * Same pagination strategy as useGroupChat.
 */
export function usePrivateMessages(
    groupId: string | number,
    userId: string | number,
    options?: Partial<UseInfiniteQueryOptions<GroupChatPage, Error>>,
) {
    return useInfiniteQuery({
        queryKey: groupsKeys.privateMessagesList(groupId, userId),
        queryFn: ({ pageParam = 1, signal }) =>
            groupsApi.getPrivateMessages(
                groupId,
                userId,
                pageParam as number,
                signal,
            ),
        getNextPageParam: (lastPage) => {
            if (!lastPage?.pagination) return undefined;
            const { current_page, last_page } = lastPage.pagination;
            return current_page < last_page ? current_page + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!groupId && !!userId,
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        ...options,
    });
}
