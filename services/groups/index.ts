/**
 * Groups Feature - API Module
 *
 * Public exports for the Groups API layer.
 * Import from '@/services/groups'.
 *
 * @example
 * ```ts
 * import {
 *     useGroupsList,
 *     useGroup,
 *     useGroupChat,
 *     groupsKeys,
 * } from '@/services/groups';
 * ```
 */

// Types
export type {
    Group,
    GroupDetail,
    GroupChatResponse,
    GroupMessage,
    GroupSchedule,
    GroupCourse,
    GroupTeacher,
    GroupAgeGroup,
    UnreadMessagesResponse,
    MessageSendPayload,
    MessageSendResponse,
    BroadcastPayload,
    BroadcastResponse,
} from "./groups.types";

// Query Keys
export { groupsKeys, type GroupsQueryKey } from "./groups.keys";

// API Functions
export { groupsApi } from "./groups.api";

// Query Hooks
export {
    useGroupsList,
    useGroup,
    useGroupChat,
    usePrivateMessages,
    useUnreadMessages,
} from "./groups.queries";
