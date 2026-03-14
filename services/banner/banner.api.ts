/**
 * Banners Feature - API Functions
 *
 * Raw API functions for banners domain.
 * These are pure functions that make HTTP requests.
 * They are used by query and mutation hooks.
 *
 * @example
 * ```ts
 * // In a query hook
 * const { data } = useQuery({
 *     queryKey: bannersKeys.list(params),
 *     queryFn: ({ signal }) => bannersApi.getList(params, signal),
 * });
 * ```
 */

import { ApiResponse } from "@/services/api";
import { api } from "@/services/api/client";
import { Banner } from ".";

const BASE_URL = "/app-banners";

/**
 * Banners API functions
 */
export const bannersApi = {
    /**
     * Get list of all banners
     */
    getList: async (): Promise<Banner[]> => {
        const response = await api.get<ApiResponse<Banner[]>>(BASE_URL);

        if (response.error) {
            throw response.error;
        }

        return response.data?.data ?? [];
    },
};

export default bannersApi;
