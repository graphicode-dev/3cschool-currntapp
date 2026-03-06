/**
 * Speakers Feature - Query Hooks
 *
 * TanStack Query hooks for reading speakers data.
 * All queries support AbortSignal for cancellation.
 *
 * @example
 * ```tsx
 * // Get speakers metadata
 * const { data: metadata } = useSpeakersMetadata();
 *
 * // Get paginated list
 * const { data } = useSpeakersList({ page: 1 });
 *
 * // Get single speaker
 * const { data: speaker } = useSpeaker(id);
 * ```
 */

import type { ListQueryParams, PaginatedData } from "@/services/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { Speaker, SpeakerMetadata } from "./";
import { speakersApi } from "./speakers.api";
import { speakersKeys } from "./speakers.keys";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch speakers metadata
 *
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data: metadata } = useSpeakersMetadata();
 * ```
 */
export function useSpeakersMetadata(
    options?: Partial<UseQueryOptions<SpeakerMetadata, Error>>,
) {
    return useQuery({
        queryKey: speakersKeys.metadata(),
        queryFn: ({ signal }) => speakersApi.getMetadata(signal),
        staleTime: 1000 * 60 * 30, // 30 minutes - metadata rarely changes
        ...options,
    });
}

/**
 * Hook to fetch list of speakers
 *
 * @param params - Query parameters for filtering
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data } = useSpeakersList();
 * const speakers = data ?? [];
 * ```
 */
export function useSpeakersList(
    params?: ListQueryParams,
    options?: Partial<UseQueryOptions<PaginatedData<Speaker>, Error>>,
) {
    return useQuery({
        queryKey: speakersKeys.list(params),
        queryFn: ({ signal }) => speakersApi.getList(params, signal),
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
    });
}

/**
 * Hook to fetch a single speaker by ID
 *
 * @param id - Speaker ID
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data: speaker } = useSpeaker(id, {
 *     enabled: !!id,
 * });
 * ```
 */
export function useSpeaker(
    id: string | number,
    options?: Partial<UseQueryOptions<Speaker, Error>>,
) {
    return useQuery({
        queryKey: speakersKeys.detail(id),
        queryFn: ({ signal }) => speakersApi.getById(id, signal),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options,
    });
}
