import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CreateTicketPayload,
    SendTicketMessagePayload,
    ticketsApi,
} from "./tickets.api";
import { ticketsKeys } from "./tickets.keys";

export function useCreateTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateTicketPayload) =>
            ticketsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
        },
    });
}

export function useSendTicketMessage(ticketId: string | number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SendTicketMessagePayload) =>
            ticketsApi.sendMessage(ticketId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ticketsKeys.detail(ticketId),
            });
        },
    });
}
