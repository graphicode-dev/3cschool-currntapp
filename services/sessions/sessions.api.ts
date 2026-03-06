/**
 * Sessions Feature - API Functions
 *
 * Raw API functions for sessions domain.
 * These are pure functions that make HTTP requests.
 * They are used by query and mutation hooks.
 *
 * @example
 * ```ts
 * // In a query hook
 * const { data } = useQuery({
 *     queryKey: sessionsKeys.allSessions(),
 *     queryFn: ({ signal }) => sessionsApi.getAllSessions(signal),
 * });
 * ```
 */

import { ApiResponse } from "@/services/api";
import { api } from "@/services/api/client";
import { AllSessionsResponse, GroupSessionsResponse } from "./sessions.types";

const BASE_URL = "/groups";

/**
 * Sessions API functions
 */
export const sessionsApi = {
    /**
     * Get all sessions (upcoming and past)
     */
    getAllSessions: async (
        signal?: AbortSignal,
    ): Promise<AllSessionsResponse> => {
        const response = await api.get<ApiResponse<AllSessionsResponse>>(
            `${BASE_URL}/all-sessions`,
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
     * Get sessions for a specific group
     */
    getGroupSessions: async (
        groupId: string | number,
        signal?: AbortSignal,
    ): Promise<GroupSessionsResponse> => {
        const response = await api.get<ApiResponse<GroupSessionsResponse>>(
            `${BASE_URL}/${groupId}/sessions`,
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

export default sessionsApi;
