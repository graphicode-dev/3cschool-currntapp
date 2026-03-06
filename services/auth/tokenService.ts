import { API_CONFIG } from "@/services/api/config/env";
import * as SecureStore from "expo-secure-store";

const KEY = API_CONFIG.TOKEN_KEY;

// In-memory cache for synchronous reads in Axios interceptors
let cached: string | undefined;

// Hydration promise — resolves once we've read SecureStore on cold start.
// Interceptors await this before checking `cached` the first time.
let hydrationPromise: Promise<void> | null = null;

const hydrate = (): Promise<void> => {
    if (!hydrationPromise) {
        hydrationPromise = SecureStore.getItemAsync(KEY).then((token) => {
            if (token) cached = token;
        });
    }
    return hydrationPromise;
};

export const tokenService = {
    /**
     * Synchronous read — only reliable after hydrate() has resolved.
     * Used by the Axios request interceptor (which calls ensureHydrated first).
     */
    getSync: (): string | undefined => cached,

    /**
     * Async read — always safe, waits for SecureStore if not yet hydrated.
     */
    get: async (): Promise<string | undefined> => {
        await hydrate();
        return cached;
    },

    /**
     * Must be called once at app startup (in root _layout.tsx) before any
     * API request fires, so the synchronous interceptor always has a token.
     */
    ensureHydrated: (): Promise<void> => hydrate(),

    set: async (token: string): Promise<void> => {
        cached = token;
        await SecureStore.setItemAsync(KEY, token);
    },

    clear: async (): Promise<void> => {
        cached = undefined;
        hydrationPromise = null;
        await SecureStore.deleteItemAsync(KEY);
    },
};
