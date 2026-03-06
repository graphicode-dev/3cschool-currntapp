import { useAuthStore } from "@/services/auth/auth.store";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function AppLayout() {
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            // Add a small delay to ensure auth state is fully settled
            const timer = setTimeout(() => {
                setShouldRedirect(true);
            }, 100);

            return () => clearTimeout(timer);
        } else {
            setShouldRedirect(false);
        }
    }, [isAuthenticated, _hasHydrated]);

    if (!_hasHydrated) {
        return null; // wait for hydration
    }

    if (shouldRedirect) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="(tabs)"
                options={{ animation: "simple_push" }}
            />
        </Stack>
    );
}
