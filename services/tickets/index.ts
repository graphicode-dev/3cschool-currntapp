/**
 * Tickets Feature - API Module
 *
 * Public exports for the Tickets API layer.
 * Import from '@/services/tickets'.
 *
 * @example
 * ```ts
 * import {
 *     useTicketsList,
 *     useTicket,
 *     ticketsKeys,
 * } from '@/services/tickets';
 * ```
 */

// Types
export type {
    Ticket,
    TicketCourseGroup,
    TicketDetail,
    TicketInstructor,
    TicketLatestMessage,
    TicketMessage,
    TicketMetadata,
    TicketStudent,
} from "./tickets.types";

// Query Keys
export { ticketsKeys, type TicketsQueryKey } from "./tickets.keys";

// API Functions
export { ticketsApi } from "./tickets.api";

// Query Hooks
export { useTicket, useTicketsList } from "./tickets.queries";

// Mutation Hooks
export { useCreateTicket, useSendTicketMessage } from "./tickets.mutations";
