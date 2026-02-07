import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

interface ApiError {
    code: number;
    message: string;
    errors?: Record<string, string[]>;
}

class ApiService {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<ApiResponse<T>> {
        const url = `${BASE_URL}${endpoint}`;

        const isFormDataBody =
            typeof FormData !== "undefined" && options.body instanceof FormData;

        const headers: HeadersInit = {
            Accept: "application/json",
            ...options.headers,
        };

        if (!isFormDataBody) {
            (headers as Record<string, string>)["Content-Type"] =
                (headers as Record<string, string>)["Content-Type"] ||
                "application/json";
        }

        if (this.token) {
            (headers as Record<string, string>)["Authorization"] =
                `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                const error: ApiError = {
                    code: data.code || response.status,
                    message: data.message || "An error occurred",
                    errors: data.errors,
                };
                throw error;
            }

            console.log(JSON.stringify(data, null, 2));

            return data as ApiResponse<T>;
        } catch (error) {
            if ((error as ApiError).code) {
                throw error;
            }

            // Network error or other fetch error
            const networkError: ApiError = {
                code: 0,
                message:
                    "Network error. Please check your internet connection.",
            };
            throw networkError;
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async postFormData<T>(
        endpoint: string,
        formData: FormData,
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: formData,
        });
    }

    async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

export const api = new ApiService();
export type { ApiError, ApiResponse };
