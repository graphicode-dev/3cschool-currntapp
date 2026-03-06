/**
 * Sessions Feature - API Module
 *
 * Public exports for the Sessions API layer.
 * Import from '@/services/sessions'.
 *
 * @example
 * ```ts
 * import {
 *     useAllSessions,
 *     useGroupSessions,
 *     sessionsKeys,
 * } from '@/services/sessions';
 * ```
 */

// Types
export type {
    AllSessionsResponse,
    GroupSessionsResponse,
    Session,
    SessionMetadata,
    SessionWithInfo,
} from "./sessions.types";

// Query Keys
export { sessionsKeys, type SessionsQueryKey } from "./sessions.keys";

// API Functions
export { sessionsApi } from "./sessions.api";

// Query Hooks
export { useAllSessions, useGroupSessions } from "./sessions.queries";
