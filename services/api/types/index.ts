/**
 * API Types and Interfaces
 * Centralized type definitions for the API layer
 *
 * All shared types should be defined here to follow DRY principle.
 * Import from '@/api' or '@/api/types' in your code.
 */

// ============================================================================
// Response Types
// ============================================================================

/**
 * Standard API response wrapper for consistent error handling
 * Used by the http client methods
 */
export interface ApiResponse<T = unknown> {
    success: boolean;

    message: string;
    data: T;
    error: ApiError | null;
}

export interface PaginatedData<T> {
    perPage: number;
    currentPage: number;
    lastPage: number;
    nextPageUrl: string | null;
    items: T[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: PaginatedData<T>;
}

export interface ListQueryParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    [key: string]: unknown;
}

/**
 * Validation errors structure from server
 * Maps field names to array of error messages
 * @example { "title": ["The title field is required."], "email": ["Invalid email format."] }
 */
export type ValidationErrors = Record<string, string[]>;

/**
 * Form field error structure compatible with react-hook-form
 */
export interface FormFieldError {
    type: string;
    message: string;
}

/**
 * Form errors map compatible with react-hook-form setError
 */
export type FormErrors = Record<string, FormFieldError>;

/**
 * Standardized API error structure
 */
export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: Record<string, unknown>;
    validationErrors?: ValidationErrors;
    isValidationError?: boolean;
}

/**
 * Single item response wrapper from backend
 * @example { data: { id: 1, name: "Item" } }
 */
export interface SingleResponse<T> {
    data: T;
}

/**
 * List response wrapper from backend (non-paginated)
 * @example { data: [{ id: 1 }, { id: 2 }] }
 */
export interface ListResponse<T> {
    data: T[];
}

/**
 * Page data structure for paginated list endpoints
 */
export interface PageData<T> {
    data: T[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
}

/**
 * Union type for list endpoints that may or may not be paginated
 */
export type ListOrPaginatedResponse<T> = ListResponse<T> | PaginatedResponse<T>;

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request configuration options for service methods
 */
export interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    signal?: AbortSignal;
}

/**
 * HTTP methods supported by the client
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Query string parameters type for buildQueryString utility
 */
export type QueryParams = Record<
    string,
    string | number | boolean | string[] | undefined | null
>;
