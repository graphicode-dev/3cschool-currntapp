import { useQuery } from "@tanstack/react-query";
import { authApi } from "./auth.api";

export const authQueryKeys = {
    all: ["auth"] as const,
    profile: () => ["auth", "profile"] as const,
};

export function useProfile() {
    return useQuery({
        queryKey: authQueryKeys.profile(),
        queryFn: () => authApi.profile(),
    });
}
