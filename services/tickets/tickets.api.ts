import { ApiResponse } from "@/services/api";
import { api } from "@/services/api/client";
import { API_CONFIG } from "@/services/api/config/env";
import { tokenService } from "@/services/auth/tokenService";
import { Ticket, TicketDetail, TicketMessage } from "./tickets.types";

const BASE_URL = "/tickets";

export interface CreateTicketPayload {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
}

export interface SendTicketMessagePayload {
    message?: string;
    /** Local file URI from expo-image-picker */
    attachmentUri?: string;
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

    create: async (payload: CreateTicketPayload): Promise<Ticket> => {
        const response = await api.post<ApiResponse<Ticket>>(BASE_URL, payload);
        if (response.error) throw response.error;
        if (!response.data?.data)
            throw new Error("No data returned from server");
        return response.data.data;
    },

    /**
     * Send a ticket message.
     *
     * Strategy:
     *  - Text only  → plain JSON via Axios (reliable, no multipart quirks)
     *  - With image → native `fetch()` with FormData
     *    Axios has a known React Native bug where it JSON-serialises FormData
     *    instead of sending it as multipart, even when Content-Type is removed.
     *    The native fetch() XHR stack handles RN FormData correctly.
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
     * Image upload via native fetch — bypasses Axios FormData serialisation bug.
     */
    _sendMessageWithImage: async (
        ticketId: string | number,
        payload: SendTicketMessagePayload,
    ): Promise<TicketMessage> => {
        const token = await tokenService.get();
        const uri = payload.attachmentUri!;
        const ext = uri.split(".").pop()?.toLowerCase() ?? "jpeg";

        const formData = new FormData();
        if (payload.message) {
            formData.append("message", payload.message);
        }
        formData.append("attachment", {
            uri,
            name: `photo.${ext}`,
            type: `image/${ext}`,
        } as any);

        const res = await fetch(
            `${API_CONFIG.BASE_URL}${BASE_URL}/${ticketId}/messages`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    // Do NOT set Content-Type — fetch sets it automatically with boundary
                },
                body: formData,
            },
        );

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(
                errorBody?.message ?? `HTTP ${res.status} uploading attachment`,
            );
        }

        const json = await res.json();
        const data: TicketMessage = json?.data ?? json;
        if (!data) throw new Error("No data returned from server");
        return data;
    },
};

export default ticketsApi;
