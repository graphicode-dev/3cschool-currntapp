import { API_CONFIG } from "@/services/api/config/env";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "./auth.types";

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    setUser: (user: User | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,
            setUser: (user) => set({ user }),
            setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setHasHydrated: (value) => set({ _hasHydrated: value }),
        }),
        {
            name: API_CONFIG.PROJECT_NAME + "-auth",
            storage: createJSONStorage(() => ({
                getItem: (name) => SecureStore.getItemAsync(name),
                setItem: (name, value) => SecureStore.setItemAsync(name, value),
                removeItem: (name) => SecureStore.deleteItemAsync(name),
            })),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);

// Use this outside React components (interceptors, utilities, etc.)
// useAuthStore and authStore are the same Zustand store instance.
export const authStore = useAuthStore;
