/**
 * Tickets Feature - Query Hooks
 *
 * TanStack Query hooks for reading tickets data.
 * All queries support AbortSignal for cancellation.
 *
 * @example
 * ```tsx
 * // Get tickets metadata
 * const { data: metadata } = useTicketsMetadata();
 *
 * // Get paginated list
 * const { data } = useTicketsList();
 *
 * // Get single ticket
 * const { data: ticket } = useTicket(id);
 * ```
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { ticketsApi } from "./tickets.api";
import { ticketsKeys } from "./tickets.keys";
import type { Ticket, TicketDetail } from "./tickets.types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch list of tickets
 *
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data } = useTicketsList();
 * const tickets = data ?? [];
 * ```
 */
export function useTicketsList(
    options?: Partial<UseQueryOptions<Ticket[], Error>>,
) {
    return useQuery({
        queryKey: ticketsKeys.list(),
        queryFn: ({ signal }) => ticketsApi.getList(signal),
        ...options,
    });
}

/**
 * Hook to fetch a single ticket by ID
 *
 * @param id - Ticket ID
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { data: ticket } = useTicket(id, {
 *     enabled: !!id,
 * });
 * ```
 */
export function useTicket(
    id: string | number,
    options?: Partial<UseQueryOptions<TicketDetail, Error>>,
) {
    return useQuery({
        queryKey: ticketsKeys.detail(id),
        queryFn: ({ signal }) => ticketsApi.getById(id, signal),
        enabled: !!id,
        ...options,
    });
}
