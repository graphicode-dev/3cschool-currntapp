/**
 * Speakers Feature - API Module
 *
 * Public exports for the Speakers API layer.
 * Import from '@/features/dashboard/admin/speakers/api'.
 *
 * @example
 * ```ts
 * import {
 *     useSpeakersList,
 *     useSpeaker,
 *     speakersKeys,
 * } from '@/features/dashboard/admin/speakers/api';
 * ```
 */

// Types
export type {
    Speaker,
    SpeakerCreatePayload,
    SpeakerMetadata,
    SpeakerUpdatePayload,
} from "./speakers.types";

// Query Keys
export { speakersKeys, type SpeakersQueryKey } from "./speakers.keys";

// API Functions
export { speakersApi } from "./speakers.api";

// Query Hooks
export {
    useSpeaker,
    useSpeakersList,
    useSpeakersMetadata,
} from "./speakers.queries";
