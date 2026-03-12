import { ApiResponse } from "@/services/api";
import { api } from "@/services/api/client";
import {
    BroadcastPayload,
    BroadcastResponse,
    Group,
    GroupChatPage,
    GroupDetail,
    MessageSendPayload,
    MessageSendResponse,
    UnreadMessagesResponse,
} from "./groups.types";
import { postFormData } from "../api/client/httpClient";

const BASE_URL = "/groups";

export const groupsApi = {
    getList: async (
        params?: { search?: string; filter?: string },
        signal?: AbortSignal,
    ): Promise<Group[]> => {
        const queryParams: Record<string, unknown> = {};
        if (params?.search?.trim()) queryParams.search = params.search.trim();
        if (params?.filter?.trim()) queryParams.filter = params.filter.trim();

        const response = await api.get<ApiResponse<Group[]>>(BASE_URL, {
            params: Object.keys(queryParams).length ? queryParams : undefined,
            signal,
        });
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    getById: async (
        id: string | number,
        signal?: AbortSignal,
    ): Promise<GroupDetail> => {
        const response = await api.get<ApiResponse<GroupDetail>>(
            `${BASE_URL}/${id}`,
            { signal },
        );
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    /**
     * Get group chat messages — paginated.
     *
     * Server JSON:  { code, message, data: GroupMessage[], pagination }
     * httpClient:   api.get<T>(url) → ApiResponse<T> where .data = raw JSON body
     *
     * If we type T = ApiResponse<GroupChatPage> → .data.data = GroupMessage[] (wrong)
     * We need T = GroupChatPage so that .data = { data: GroupMessage[], pagination } ✅
     */
    getGroupChat: async (
        groupId: string | number,
        page: number = 1,
        signal?: AbortSignal,
    ): Promise<GroupChatPage> => {
        const response = await api.get<GroupChatPage>(
            `${BASE_URL}/${groupId}/chat`,
            { params: { page }, signal },
        );
        if (response.error) throw response.error;
        if (!response.data) throw new Error("No data returned from server");
        return response.data;
    },

    sendGroupChatMessage: async (
        groupId: string | number,
        payload: MessageSendPayload,
    ): Promise<MessageSendResponse> => {
        // Use the working pattern from the reference code with postFormData
        if (payload.attachment) {
            const formData = new FormData();
            if (payload.message && payload.message.trim().length > 0) {
                formData.append("message", payload.message.trim());
            }

            formData.append("attachment", {
                uri: (payload.attachment as any).uri,
                name: (payload.attachment as any).name,
                type:
                    (payload.attachment as any).mimeType ||
                    "application/octet-stream",
            } as any);

            const response = await postFormData<MessageSendResponse>(
                `/groups/${groupId}/chat`,
                formData,
            );
            if (response.error) throw response.error;
            if (!response.data) throw new Error("No data returned from server");
            return response.data;
        }

        const response = await api.post<ApiResponse<MessageSendResponse>>(
            `/groups/${groupId}/chat`,
            {
                message: payload.message || "",
            },
        );
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    /**
     * Get private messages — paginated.
     * Same typing fix as getGroupChat.
     */
    getPrivateMessages: async (
        groupId: string | number,
        userId: string | number,
        page: number = 1,
        signal?: AbortSignal,
    ): Promise<GroupChatPage> => {
        const response = await api.get<GroupChatPage>(
            `${BASE_URL}/${groupId}/messages/${userId}`,
            { params: { page }, signal },
        );
        if (response.error) throw response.error;
        if (!response.data) throw new Error("No data returned from server");
        return response.data;
    },

    sendPrivateMessage: async (
        groupId: string | number,
        userId: string | number,
        payload: MessageSendPayload,
    ): Promise<MessageSendResponse> => {
        // Use the working pattern from the reference code with postFormData
        const formData = new FormData();
        if (payload.message && payload.message.trim().length > 0) {
            formData.append("message", payload.message.trim());
        }

        if (payload.attachment) {
            formData.append("attachment", {
                uri: (payload.attachment as any).uri,
                name: (payload.attachment as any).name,
                type:
                    (payload.attachment as any).mimeType ||
                    "application/octet-stream",
            } as any);
        }
        const response = await postFormData<MessageSendResponse>(
            `/groups/${groupId}/messages/${userId}`,
            formData,
        );
        if (response.error) throw response.error;
        if (!response.data) throw new Error("No data returned from server");
        return response.data;
    },

    sendBroadcastMessage: async (
        groupId: string | number,
        payload: BroadcastPayload,
    ): Promise<BroadcastResponse> => {
        const formData = new FormData();
        formData.append("message", payload.message);

        const response = await api.post<ApiResponse<BroadcastResponse>>(
            `${BASE_URL}/${groupId}/broadcast`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    getUnreadMessages: async (
        signal?: AbortSignal,
    ): Promise<UnreadMessagesResponse> => {
        const response = await api.get<ApiResponse<UnreadMessagesResponse>>(
            "/messages/unread",
            { signal },
        );
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },
};

export default groupsApi;
