/**
 * Sessions Feature - Query Hooks
 *
 * TanStack Query hooks for reading sessions data.
 * All queries support AbortSignal for cancellation.
 *
 * @example
 * ```tsx
 * // Get sessions metadata
 * const { data: metadata } = useSessionsMetadata();
 *
 * // Get all sessions
 * const { data } = useAllSessions();
 *
 * // Get group sessions
 * const { data } = useGroupSessions(groupId);
 * ```
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { sessionsApi } from "./sessions.api";
import { sessionsKeys } from "./sessions.keys";
import type {
    AllSessionsResponse,
    GroupSessionsResponse,
} from "./sessions.types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch all sessions (upcoming and past)
 *
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data } = useAllSessions();
 * const sessions = data ?? { upcoming: [], past: [], total_upcoming: 0, total_past: 0 };
 * ```
 */
export function useAllSessions(
    options?: Partial<UseQueryOptions<AllSessionsResponse, Error>>,
) {
    return useQuery({
        queryKey: sessionsKeys.allSessions(),
        queryFn: ({ signal }) => sessionsApi.getAllSessions(signal),
        ...options,
    });
}

/**
 * Hook to fetch sessions for a specific group
 *
 * @param groupId - Group ID
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data: groupSessions } = useGroupSessions(groupId, {
 *     enabled: !!groupId,
 * });
 * ```
 */
export function useGroupSessions(
    groupId: string | number,
    options?: Partial<UseQueryOptions<GroupSessionsResponse, Error>>,
) {
    return useQuery({
        queryKey: sessionsKeys.groupSessionsList(groupId),
        queryFn: ({ signal }) => sessionsApi.getGroupSessions(groupId, signal),
        enabled: !!groupId,
        ...options,
    });
}
