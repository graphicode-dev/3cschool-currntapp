import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { authQueryKeys } from "./auth.queries";
import { useAuthStore } from "./auth.store";
import type { LoginData, UpdateProfileRequest } from "./auth.types";
import { tokenService } from "./tokenService";
import { useTasksStore } from "../tasks/tasks.store";

export function useLogin() {
    const { setUser, setIsAuthenticated } = useAuthStore();

    return useMutation({
        mutationFn: (credentials: LoginData) => authApi.login(credentials),
        onSuccess: async (user) => {
            await tokenService.set(user.token);
            setUser(user);
            setIsAuthenticated(true);
        },
    });
}

export function useLogout() {
    const { setUser, setIsAuthenticated } = useAuthStore();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSettled: async () => {
            setUser(null);
            setIsAuthenticated(false);
            await tokenService.clear();
            // Clear persisted tasks on logout
            useTasksStore.getState().clearTasks();
        },
    });
}

export function useUpdateProfile() {
    const { setUser } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateProfileRequest) =>
            authApi.updateProfile(payload),
        onSuccess: (updatedUser) => {
            // Persist updated user in Zustand store
            setUser(updatedUser);
            // Invalidate profile query so any screen using useProfile() re-fetches
            queryClient.invalidateQueries({
                queryKey: authQueryKeys.profile(),
            });
        },
    });
}
