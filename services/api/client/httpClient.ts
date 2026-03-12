/**
 * Enhanced HTTP Client
 *
 * Extended Axios client with:
 * - Auth modes (required | optional | none)
 * - Multipart/FormData support
 * - Advanced params serialization
 * - AbortSignal support for TanStack Query
 *
 * This is an additive enhancement - the original httpClient.ts remains unchanged
 * for backward compatibility during migration.
 */

import { authStore } from "@/services/auth/auth.store";
import { tokenService } from "@/services/auth/tokenService";
import { logger } from "@/utils";
import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import { API_CONFIG } from "../config/env";
import type { ApiError, ApiResponse, ValidationErrors } from "../types";
import { serializeParams, type ParamValue } from "./paramsSerializer";
import {
    META_PROCESSED,
    type AuthMode,
    type EnhancedRequestConfig,
    type RequestMeta,
} from "./requestTypes";

// Token refresh state
let isRefreshingToken = false;

/**
 * Extended Axios config with meta support
 */
interface ExtendedAxiosConfig extends InternalAxiosRequestConfig {
    meta?: RequestMeta;
    [META_PROCESSED]?: boolean;
    _retry?: boolean;
}

/**
 * Create the enhanced HTTP client
 */
const createEnhancedHttpClient = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        // Use custom params serializer
        paramsSerializer: {
            serialize: (params) =>
                serializeParams(params as Record<string, ParamValue>),
        },
    });

    setupEnhancedRequestInterceptors(instance);
    setupEnhancedResponseInterceptors(instance);

    return instance;
};

/**
 * Get auth mode from config, defaulting to 'required'
 */
const getAuthMode = (config: ExtendedAxiosConfig): AuthMode => {
    return config.meta?.auth ?? "required";
};

/**
 * Check if request should include auth token
 */
const shouldIncludeAuth = (config: ExtendedAxiosConfig): boolean => {
    const authMode = getAuthMode(config);
    if (authMode === "none") return false;

    const token = tokenService.getSync();
    return !!token;
};

/**
 * Check if 401 should trigger redirect
 */
const shouldRedirectOn401 = (config: ExtendedAxiosConfig): boolean => {
    const authMode = getAuthMode(config);
    return authMode === "required";
};

/**
 * Request interceptors with auth mode support
 */
const setupEnhancedRequestInterceptors = (instance: AxiosInstance): void => {
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const extConfig = config as ExtendedAxiosConfig;

            // Skip if already processed
            if (extConfig[META_PROCESSED]) {
                return config;
            }
            extConfig[META_PROCESSED] = true;

            // Handle auth based on mode
            if (shouldIncludeAuth(extConfig)) {
                const token = tokenService.getSync();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }

            // Handle multipart
            if (extConfig.meta?.multipart || config.data instanceof FormData) {
                delete config.headers["Content-Type"];
            }

            // Add request ID
            const requestId =
                extConfig.meta?.requestId || generateRequestId(config);
            config.headers["X-Request-ID"] = requestId;

            // Add language header
            const currentLanguage = "en"; // Default to English for React Native
            config.headers["Accept-Language"] = currentLanguage;

            return config;
        },
        (error) => Promise.reject(error),
    );
};

/**
 * Response interceptors with auth mode support
 */
const setupEnhancedResponseInterceptors = (instance: AxiosInstance): void => {
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as ExtendedAxiosConfig;

            // Skip logout requests
            const isLogoutRequest = originalRequest?.url?.includes("/logout");

            // Handle 401 based on auth mode
            if (
                !isLogoutRequest &&
                error.response?.status === 401 &&
                originalRequest &&
                !originalRequest._retry
            ) {
                // Only redirect if auth mode is 'required'
                if (shouldRedirectOn401(originalRequest)) {
                    if (!isRefreshingToken) {
                        isRefreshingToken = true;
                        handleUnauthorized();
                    }
                }
            }

            return Promise.reject(error);
        },
    );
};

/**
 * Handle unauthorized - clear tokens and redirect
 */
const handleUnauthorized = (): void => {
    tokenService.clear();

    // Clear auth state from store
    const store = authStore.getState();
    store.setUser(null);
    store.setIsAuthenticated(false);

    // Navigate using expo-router
    router.replace("/login");

    isRefreshingToken = false;
};

/**
 * Generate unique request ID
 */
const generateRequestId = (config: InternalAxiosRequestConfig): string => {
    return `${config.method}-${config.url}-${Date.now()}`;
};

/**
 * Check if error is from AbortSignal cancellation
 */
const isAbortError = (error: unknown): boolean => {
    if (error instanceof Error) {
        return (
            error.name === "AbortError" ||
            error.name === "CanceledError" ||
            (error as AxiosError).code === "ERR_CANCELED"
        );
    }
    return false;
};

/**
 * Server error response structure
 */
interface ServerErrorResponse {
    success?: boolean;
    message?: string;
    errors?: ValidationErrors;
    code?: string;
}

/**
 * Check if error response contains validation errors
 */
const hasValidationErrors = (data: ServerErrorResponse): boolean => {
    return (
        data?.errors !== undefined &&
        typeof data.errors === "object" &&
        Object.keys(data.errors).length > 0
    );
};

/**
 * Transform Axios errors to standardized ApiError format
 */
export const transformError = (error: AxiosError): ApiError => {
    // Handle abort/cancellation (both CancelToken and AbortSignal)
    if (axios.isCancel(error) || isAbortError(error)) {
        return {
            message: "Request was cancelled",
            code: "CANCELLED",
        };
    }

    if (error.response) {
        const responseData = error.response.data as ServerErrorResponse;
        const isValidationError = hasValidationErrors(responseData);

        return {
            message: responseData?.message || "Request failed",
            status: error.response.status,
            code: responseData?.code || undefined,
            details: responseData as Record<string, unknown>,
            validationErrors: isValidationError
                ? responseData.errors
                : undefined,
            isValidationError,
        };
    }

    if (error.request) {
        return {
            message: "No response received from server",
            code: "NETWORK_ERROR",
        };
    }

    return {
        message: error.message || "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
    };
};

/**
 * Normalize API field names to form field names
 * Handles nested array/object fields by extracting the last meaningful segment:
 * - Nested array fields: "groupSchedules.0.startTime" -> "startTime"
 * - Nested object fields: "user.email" -> "email" (uses last segment)
 *
 * Note: Does NOT convert snake_case to camelCase - field names are kept as-is
 * to match form field names exactly.
 */
const normalizeFieldName = (field: string): string => {
    // Handle nested array/object fields - extract the last meaningful segment
    // e.g., "groupSchedules.0.startTime" -> "startTime"
    // e.g., "user.profile.email" -> "email"
    if (field.includes(".")) {
        const segments = field.split(".");
        // Get the last non-numeric segment
        for (let i = segments.length - 1; i >= 0; i--) {
            if (!/^\d+$/.test(segments[i])) {
                return segments[i];
            }
        }
    }

    // Return field as-is (no snake_case to camelCase conversion)
    return field;
};

/**
 * Convert validation errors to form-compatible format (react-hook-form)
 * Takes the first error message for each field
 * Automatically normalizes nested API field names to simpler form field names
 *
 * @example
 * ```ts
 * const { error } = await api.post('/items', data);
 * if (error?.isValidationError) {
 *     const formErrors = toFormErrors(error.validationErrors);
 *     Object.entries(formErrors).forEach(([field, error]) => {
 *         form.setError(field, error);
 *     });
 * }
 * ```
 */
export const toFormErrors = (
    validationErrors?: ValidationErrors,
    fieldMapping?: Record<string, string>,
): Record<string, { type: string; message: string }> => {
    if (!validationErrors) return {};

    return Object.entries(validationErrors).reduce(
        (acc, [field, messages]) => {
            if (messages && messages.length > 0) {
                // Use custom mapping if provided, otherwise normalize automatically
                const normalizedField =
                    fieldMapping?.[field] ?? normalizeFieldName(field);
                acc[normalizedField] = {
                    type: "server",
                    message: messages[0],
                };
            }
            return acc;
        },
        {} as Record<string, { type: string; message: string }>,
    );
};

/**
 * Apply validation errors to a react-hook-form instance
 *
 * @example
 * ```ts
 * const { error } = await api.post('/items', data);
 * if (error?.isValidationError) {
 *     applyServerErrors(form.setError, error.validationErrors);
 * }
 * ```
 */
export const applyServerErrors = <T extends string>(
    setError: (name: T, error: { type: string; message: string }) => void,
    validationErrors?: ValidationErrors,
): void => {
    if (!validationErrors) return;

    Object.entries(validationErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
            setError(field as T, {
                type: "server",
                message: messages[0],
            });
        }
    });
};

/**
 * Get all error messages for a specific field
 */
export const getFieldErrors = (
    validationErrors?: ValidationErrors,
    field?: string,
): string[] => {
    if (!validationErrors || !field) return [];
    return validationErrors[field] || [];
};

/**
 * Get the first error message for a specific field
 */
export const getFieldError = (
    validationErrors?: ValidationErrors,
    field?: string,
): string | undefined => {
    const errors = getFieldErrors(validationErrors, field);
    return errors[0];
};

export function throwApiError(error: ApiError, fallback: string): never {
    throw error.message ? error : { ...error, message: fallback };
}

export async function postFormData<T>(
    endpoint: string,
    formData: FormData,
): Promise<ApiResponse<T>> {
    try {
        const token = await tokenService.get();
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorBody?.message ?? `HTTP ${response.status}`,
                data: {} as T,
                error: {
                    message: errorBody?.message ?? `HTTP ${response.status}`,
                    status: response.status,
                },
            };
        }

        const json = await response.json();
        const data: T = json?.data ?? json;
        return {
            success: true,
            message: "",
            data,
            error: null,
        };
    } catch (error) {
        const apiError = transformError(error as AxiosError);
        console.error("apiError:", error);
        return {
            success: false,
            message: apiError.message,
            data: {} as T,
            error: apiError,
        };
    }
}

/**
 * The enhanced HTTP client instance
 */
export const enhancedHttpClient = createEnhancedHttpClient();

/**
 * Enhanced HTTP wrapper with meta support and AbortSignal
 *
 * @example
 * ```ts
 * // Public endpoint (no auth)
 * const response = await api.get('/public/data', {
 *     meta: { auth: 'none' }
 * });
 *
 * // Optional auth (add token if available, don't redirect on 401)
 * const response = await api.get('/user/preferences', {
 *     meta: { auth: 'optional' }
 * });
 *
 * // With AbortSignal (TanStack Query)
 * const { data } = useQuery({
 *     queryFn: ({ signal }) => api.get('/items', { signal }),
 * });
 *
 * // With complex params
 * const response = await api.get('/items', {
 *     params: {
 *         page: 1,
 *         filters: { status: 'active', types: ['a', 'b'] },
 *         sort: { field: 'name', order: 'asc' }
 *     }
 * });
 *
 * // Multipart upload
 * const formData = new FormData();
 * formData.append('file', file);
 * const response = await api.post('/upload', formData, {
 *     meta: { multipart: true }
 * });
 * ```
 */
export const api = {
    /**
     * GET request
     */
    async get<T>(
        url: string,
        config?: EnhancedRequestConfig,
    ): Promise<ApiResponse<T>> {
        logger.log("🚀 HTTP GET Request:", "", { url, config });
        try {
            const response = await enhancedHttpClient.get<T>(url, config);
            logger.log("✅ HTTP GET Response:", "", {
                url,
                status: response.status,
                data: response.data,
            });
            return {
                success: true,
                message: "",
                data: response.data,
                error: null,
            };
        } catch (error) {
            logger.error("❌ HTTP GET Error:", "", { url, error });
            const apiError = transformError(error as AxiosError);
            return {
                success: false,
                message: apiError.message,
                data: {} as T,
                error: apiError,
            };
        }
    },

    /**
     * POST request
     */
    async post<T>(
        url: string,
        data?: unknown,
        config?: EnhancedRequestConfig,
    ): Promise<ApiResponse<T>> {
        logger.log(
            "🚀 HTTP POST Request:",
            JSON.stringify({ url, data, config }, null, 2),
        );
        try {
            const response = await enhancedHttpClient.post<T>(
                url,
                data,
                config,
            );
            logger.log("✅ HTTP POST Response:", "", {
                url,
                status: response.status,
                data: response.data,
            });
            return {
                success: true,
                message: "",
                data: response.data,
                error: null,
            };
        } catch (error) {
            logger.error("❌ HTTP POST Error:", "", { url, error });
            const apiError = transformError(error as AxiosError);
            return {
                success: false,
                message: apiError.message,
                data: {} as T,
                error: apiError,
            };
        }
    },

    /**
     * PUT request
     */
    async put<T>(
        url: string,
        data?: unknown,
        config?: EnhancedRequestConfig,
    ): Promise<ApiResponse<T>> {
        logger.log("🚀 HTTP PUT Request:", "", { url, data, config });
        try {
            const response = await enhancedHttpClient.put<T>(url, data, config);
            logger.log("✅ HTTP PUT Response:", "", {
                url,
                status: response.status,
                data: response.data,
            });
            return {
                success: true,
                message: "",
                data: response.data,
                error: null,
            };
        } catch (error) {
            logger.error("❌ HTTP PUT Error:", "", { url, error });
            const apiError = transformError(error as AxiosError);
            return {
                success: false,
                message: apiError.message,
                data: {} as T,
                error: apiError,
            };
        }
    },

    /**
     * PATCH request
     */
    async patch<T>(
        url: string,
        data?: unknown,
        config?: EnhancedRequestConfig,
    ): Promise<ApiResponse<T>> {
        logger.log("🚀 HTTP PATCH Request:", "", { url, data, config });
        try {
            const response = await enhancedHttpClient.patch<T>(
                url,
                data,
                config,
            );
            logger.log("✅ HTTP PATCH Response:", "", {
                url,
                status: response.status,
                data: response.data,
            });
            return {
                success: true,
                message: "",
                data: response.data,
                error: null,
            };
        } catch (error) {
            logger.error("❌ HTTP PATCH Error:", "", { url, error });
            const apiError = transformError(error as AxiosError);
            return {
                success: false,
                message: apiError.message,
                data: {} as T,
                error: apiError,
            };
        }
    },

    /**
     * DELETE request
     */
    async delete<T>(
        url: string,
        config?: EnhancedRequestConfig,
    ): Promise<ApiResponse<T>> {
        logger.log("🚀 HTTP DELETE Request:", "", { url, config });
        try {
            const response = await enhancedHttpClient.delete<T>(url, config);
            logger.log("✅ HTTP DELETE Response:", "", {
                url,
                status: response.status,
                data: response.data,
            });
            return {
                success: true,
                message: "",
                data: response.data,
                error: null,
            };
        } catch (error) {
            logger.error("❌ HTTP DELETE Error:", "", { url, error });
            const apiError = transformError(error as AxiosError);
            return {
                success: false,
                message: apiError.message,
                data: {} as T,
                error: apiError,
            };
        }
    },
};

export default api;
