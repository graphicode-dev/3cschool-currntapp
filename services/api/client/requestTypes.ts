/**
 * Enhanced Request Types
 *
 * Types for the enhanced HTTP client with auth modes,
 * multipart support, and AbortSignal integration.
 */

import type { AxiosRequestConfig } from "axios";

/**
 * Authentication mode for requests
 *
 * - `required`: Add auth token, redirect to login on 401 (default)
 * - `optional`: Add auth token if available, don't redirect on 401
 * - `none`: Never add auth token, skip auth interceptor entirely
 */
export type AuthMode = "required" | "optional" | "none";

/**
 * Request metadata for controlling request behavior
 */
export interface RequestMeta {
    /**
     * Authentication mode
     * @default 'required'
     */
    auth?: AuthMode;

    /**
     * Whether this is a multipart/form-data request
     * When true, Content-Type header is removed to let browser set it with boundary
     * @default false
     */
    multipart?: boolean;

    /**
     * Custom request identifier for logging/tracing
     */
    requestId?: string;

    // Note: retry and retryCount are reserved for future implementation
    // They are not currently used by the enhanced HTTP client
}

/**
 * Enhanced request configuration extending Axios config
 */
export interface EnhancedRequestConfig<D = unknown> extends Omit<
    AxiosRequestConfig<D>,
    "params"
> {
    /**
     * Request metadata for auth, multipart, etc.
     */
    meta?: RequestMeta;

    /**
     * Query parameters (will be serialized with advanced serializer)
     */
    params?: Record<string, unknown>;

    /**
     * AbortSignal for request cancellation (TanStack Query integration)
     */
    signal?: AbortSignal;
}

/**
 * HTTP method type
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Request function signature for the enhanced client
 */
export type RequestFn<T> = (
    url: string,
    config?: EnhancedRequestConfig
) => Promise<T>;

/**
 * Request function with body signature
 */
export type RequestWithBodyFn<T> = (
    url: string,
    data?: unknown,
    config?: EnhancedRequestConfig
) => Promise<T>;

/**
 * Symbol to mark config as having meta processed
 */
export const META_PROCESSED = Symbol("meta_processed");

/**
 * Internal config type with meta processing flag
 */
export interface InternalRequestConfig extends AxiosRequestConfig {
    meta?: RequestMeta;
    [META_PROCESSED]?: boolean;
}
