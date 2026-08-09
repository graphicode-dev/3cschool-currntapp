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
import { AllSessionsResponse, GroupSessionsResponse, Session } from "./sessions.types";

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

        const rawData = response.data?.data ?? response.data;
        if (!rawData) {
            return {
                upcoming: [],
                past: [],
                total_upcoming: 0,
                total_past: 0,
            };
        }

        // Normalize the data if backend returns a raw array
        if (Array.isArray(rawData)) {
            return {
                upcoming: rawData,
                past: [],
                total_upcoming: rawData.length,
                total_past: 0,
            };
        }

        // Extract upcoming sessions array flexibly
        const upcomingList: Session[] =
            rawData.upcoming ??
            rawData.upcoming_sessions ??
            rawData.active_sessions ??
            rawData.active ??
            rawData.sessions ??
            [];

        // Extract past sessions array flexibly
        const pastList: Session[] =
            rawData.past ??
            rawData.past_sessions ??
            rawData.completed_sessions ??
            rawData.completed ??
            rawData.history ??
            [];

        return {
            upcoming: upcomingList,
            past: pastList,
            total_upcoming: rawData.total_upcoming ?? upcomingList.length,
            total_past: rawData.total_past ?? pastList.length,
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

        const rawData = response.data?.data ?? response.data;
        if (!rawData) {
            return {
                group_id: Number(groupId),
                group_name: "Group",
                sessions: [],
            };
        }

        // Normalize if backend returns a raw array
        if (Array.isArray(rawData)) {
            return {
                group_id: Number(groupId),
                group_name: "Group",
                sessions: rawData,
            };
        }

        const sessionsList =
            rawData.sessions ??
            rawData.data ??
            (Array.isArray(rawData) ? rawData : []);

        return {
            group_id: rawData.group_id ?? Number(groupId),
            group_name: rawData.group_name ?? "Group",
            sessions: Array.isArray(sessionsList) ? sessionsList : [],
        };
    },
};

export default sessionsApi;
