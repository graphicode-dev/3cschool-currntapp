import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CreateTicketPayload,
    CreateTicketResponse,
    SendTicketMessagePayload,
    ticketsApi,
} from "./tickets.api";
import { ticketsKeys } from "./tickets.keys";
import type { TicketMessage } from "./tickets.types";

export function useCreateTicket() {
    const queryClient = useQueryClient();

    return useMutation<CreateTicketResponse, Error, CreateTicketPayload>({
        mutationFn: (payload: CreateTicketPayload) =>
            ticketsApi.create(payload),
        onSuccess: () => {
            // Invalidate tickets list to show new ticket
            queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
        },
        onError: (error) => {
            console.error("Failed to create ticket:", error);
        },
    });
}

export function useSendTicketMessage(ticketId: string | number) {
    const queryClient = useQueryClient();

    return useMutation<TicketMessage, Error, SendTicketMessagePayload>({
        mutationFn: (payload: SendTicketMessagePayload) =>
            ticketsApi.sendMessage(ticketId, payload),
        onSuccess: () => {
            // Invalidate specific ticket to show new message
            queryClient.invalidateQueries({
                queryKey: ticketsKeys.detail(ticketId),
            });
            // Also invalidate list to update latest_message
            queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
        },
        onError: (error) => {
            console.error("Failed to send ticket message:", error);
        },
    });
}

export function useCloseTicket() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string | number>({
        mutationFn: (ticketId: string | number) =>
            ticketsApi.closeTicket(ticketId),
        onSuccess: (_, ticketId) => {
            // Invalidate specific ticket
            queryClient.invalidateQueries({
                queryKey: ticketsKeys.detail(ticketId),
            });
            // Also invalidate list to update status
            queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
        },
        onError: (error) => {
            console.error("Failed to close ticket:", error);
        },
    });
}
