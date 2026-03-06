/**
 * HTTP Client exports
 *
 * Centralized exports for HTTP client, utilities, and helpers.
 * Import from '@/api' or '@/api/client' in your code.
 */

// Enhanced HTTP client with auth modes and advanced params
export { api, enhancedHttpClient } from "./httpClient";
export { transformError as transformApiError } from "./httpClient";

// Validation error helpers
export {
    toFormErrors,
    applyServerErrors,
    getFieldErrors,
    getFieldError,
} from "./httpClient";

// Params serializer
export {
    serializeParams,
    createParamsSerializer,
    type ParamValue,
    type SerializerOptions,
    type PaginationParams,
    type SortParams,
    type FilterParams,
    type ListQueryParams,
} from "./paramsSerializer";

// Request types
export {
    type AuthMode,
    type RequestMeta,
    type EnhancedRequestConfig,
    type HttpMethod,
    META_PROCESSED,
} from "./requestTypes";
