import { ToastProvider } from "@/components/ui/Toast";
import { LanguageProvider } from "@/contexts/language-context";
import { queryClient } from "@/lib/queryClient";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { NotificationProvider } from "./NotificationProvider";

function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <ThemeProvider value={DefaultTheme}>
                    <ToastProvider>
                        <NotificationProvider>{children}</NotificationProvider>
                    </ToastProvider>
                </ThemeProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
}

export default Providers;
