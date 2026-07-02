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
        const response = await api.get<ApiResponse<any>>(
            `${BASE_URL}/all-sessions`,
            { signal },
        );

        if (response.error) {
            throw response.error;
        }

        if (!response.data?.data) {
            throw new Error("No data returned from server");
        }

        const rawData = response.data.data;
        
        // Normalize the data if backend returns an array
        if (Array.isArray(rawData)) {
            return {
                upcoming: rawData,
                past: [],
                total_upcoming: rawData.length,
                total_past: 0,
            };
        }

        // Normalize if backend returns snake_case or standard keys
        return {
            upcoming: rawData.upcoming ?? rawData.upcoming_sessions ?? [],
            past: rawData.past ?? rawData.past_sessions ?? [],
            total_upcoming: rawData.total_upcoming ?? rawData.upcoming?.length ?? rawData.upcoming_sessions?.length ?? 0,
            total_past: rawData.total_past ?? rawData.past?.length ?? rawData.past_sessions?.length ?? 0,
        };
    },

    /**
     * Get sessions for a specific group
     */
    getGroupSessions: async (
        groupId: string | number,
        signal?: AbortSignal,
    ): Promise<GroupSessionsResponse> => {
        const response = await api.get<ApiResponse<any>>(
            `${BASE_URL}/${groupId}/sessions`,
            { signal },
        );

        if (response.error) {
            throw response.error;
        }

        if (!response.data?.data) {
            throw new Error("No data returned from server");
        }

        const rawData = response.data.data;

        // Normalize if backend returns an array
        if (Array.isArray(rawData)) {
            return {
                group_id: Number(groupId),
                group_name: "Group",
                sessions: rawData,
            };
        }

        return {
            group_id: rawData.group_id ?? Number(groupId),
            group_name: rawData.group_name ?? "Group",
            sessions: rawData.sessions ?? [],
        };
    },
};

export default sessionsApi;
