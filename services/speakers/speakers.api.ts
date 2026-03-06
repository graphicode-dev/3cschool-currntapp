/**
 * Speakers Feature - API Functions
 *
 * Raw API functions for speakers domain.
 * These are pure functions that make HTTP requests.
 * They are used by query and mutation hooks.
 *
 * @example
 * ```ts
 * // In a query hook
 * const { data } = useQuery({
 *     queryKey: speakersKeys.list(params),
 *     queryFn: ({ signal }) => speakersApi.getList(params, signal),
 * });
 * ```
 */

import { ApiResponse, ListQueryParams, PaginatedData } from "@/services/api";
import { api } from "@/services/api/client";
import { Speaker, SpeakerMetadata } from "./";

const BASE_URL = "/system-managements/speakers";

/**
 * Speakers API functions
 */
export const speakersApi = {
    /**
     * Get speakers metadata (filters, operators, field types)
     */
    getMetadata: async (signal?: AbortSignal): Promise<SpeakerMetadata> => {
        const response = await api.get<ApiResponse<SpeakerMetadata>>(
            `${BASE_URL}/metadata`,
            { signal },
        );

        if (response.error) {
            throw response.error;
        }

        if (!response.data?.data) {
            throw new Error("No data returned from server");
        }

        return response.data.data;
    },

    /**
     * Get list of all speakers
     */
    getList: async (
        params?: ListQueryParams,
        signal?: AbortSignal,
    ): Promise<PaginatedData<Speaker>> => {
        const { search, page = 1, perPage = 10, ...restParams } = params ?? {};

        // Build query params, only include non-empty values
        const queryParams: Record<string, unknown> = {
            page,
            ...restParams,
        };

        if (search?.trim()) {
            queryParams.search = search.trim();
        }

        const response = await api.get<ApiResponse<PaginatedData<Speaker>>>(
            BASE_URL,
            {
                params: queryParams,
                signal,
            },
        );

        if (response.error) {
            throw response.error;
        }

        // API returns paginated response
        return (
            response.data?.data ?? { items: [], total: 0, page: 1, perPage: 10 }
        );
    },

    /**
     * Get single speaker by ID
     */
    getById: async (
        id: string | number,
        signal?: AbortSignal,
    ): Promise<Speaker> => {
        const response = await api.get<ApiResponse<Speaker>>(
            `${BASE_URL}/${id}`,
            { signal },
        );

        if (response.error) {
            throw response.error;
        }

        if (!response.data?.data) {
            throw new Error("No data returned from server");
        }

        return response.data.data;
    },
};

export default speakersApi;
