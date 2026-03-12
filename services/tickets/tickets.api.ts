import { ApiResponse } from "@/services/api";
import { api } from "@/services/api/client";
import { postFormData } from "@/services/api/client/httpClient";
import { Ticket, TicketDetail, TicketMessage } from "./tickets.types";

const BASE_URL = "/tickets";

export interface CreateTicketPayload {
    title: string;
    message?: string;
    priority: "high" | "medium" | "low";
}

export interface SendTicketMessagePayload {
    message?: string;
    /** Local file URI from expo-image-picker */
    attachmentUri?: string;
}

export interface CreateTicketResponse {
    ticket: TicketDetail;
    replies: TicketMessage[];
}

export const ticketsApi = {
    getList: async (signal?: AbortSignal): Promise<Ticket[]> => {
        const response = await api.get<ApiResponse<Ticket[]>>(BASE_URL, {
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
    ): Promise<TicketDetail> => {
        const response = await api.get<ApiResponse<TicketDetail>>(
            `${BASE_URL}/${id}`,
            { signal },
        );
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    create: async (
        payload: CreateTicketPayload,
    ): Promise<CreateTicketResponse> => {
        const response = await api.post<ApiResponse<CreateTicketResponse>>(
            BASE_URL,
            payload,
        );
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    /**
     * Send a ticket message reply.
     *
     * Strategy:
     *  - Text only  → plain JSON via Axios (reliable, no multipart quirks)
     *  - With image → FormData via postFormData (handles React Native FormData correctly)
     */
    sendMessage: async (
        ticketId: string | number,
        payload: SendTicketMessagePayload,
    ): Promise<TicketMessage> => {
        if (payload.attachmentUri) {
            return ticketsApi._sendMessageWithImage(ticketId, payload);
        }

        // ── Text-only: plain JSON ────────────────────────────────────────────
        const response = await api.post<ApiResponse<TicketMessage>>(
            `${BASE_URL}/${ticketId}/reply`,
            { message: payload.message ?? "" },
        );
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    /**
     * Image upload via FormData — handles React Native FormData correctly.
     */
    _sendMessageWithImage: async (
        ticketId: string | number,
        payload: SendTicketMessagePayload,
    ): Promise<TicketMessage> => {
        const formData = new FormData();
        if (payload.message) {
            formData.append("message", payload.message);
        }

        if (payload.attachmentUri) {
            const uri = payload.attachmentUri;
            const ext = uri.split(".").pop()?.toLowerCase() ?? "jpeg";
            formData.append("attachment", {
                uri,
                name: `photo.${ext}`,
                type: `image/${ext}`,
            } as any);
        }

        const response = await postFormData<TicketMessage>(
            `${BASE_URL}/${ticketId}/reply`,
            formData,
        );
        if (response.error) throw response.error;
        if (!response.data) throw new Error("No data returned from server");
        return response.data;
    },

    /**
     * Close a ticket (admin only)
     */
    closeTicket: async (ticketId: string | number): Promise<void> => {
        const response = await api.post<ApiResponse<void>>(
            `${BASE_URL}/${ticketId}/close`,
        );
        if (response.error) throw response.error;
    },
};

export default ticketsApi;
