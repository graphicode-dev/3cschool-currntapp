import { ToastProvider } from "@/components/ui/Toast";
import { LanguageProvider } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { queryClient } from "@/lib/queryClient";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
    const colorScheme = useColorScheme();

    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                    <ToastProvider>{children}</ToastProvider>
                </ThemeProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
}

export default Providers;
