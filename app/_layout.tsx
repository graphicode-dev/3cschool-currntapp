import { applyRTL, loadSavedLanguage } from "@/i18n";
import Providers from "@/providers";
import { tokenService } from "@/services/auth/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

Sentry.init({
    dsn: "https://ee7123341869cb33cc367394ff18e836@o4511881600368640.ingest.us.sentry.io/4511881604169728",
    tracesSampleRate: 1.0,
    integrations: [
        Sentry.expoRouterIntegration({
            enableTimeToInitialDisplay: !isRunningInExpoGo(),
        }),
    ],
    enableNativeFramesTracking: !isRunningInExpoGo(),
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
    const enableClearStorage = false;

    // Both must be true before we render — prevents screens from firing
    // API requests before the auth token is in the in-memory cache.
    const [directionReady, setDirectionReady] = useState(false);
    const [tokenReady, setTokenReady] = useState(false);

    const [fontsLoaded, fontError] = useFonts({
        "Poppins-Regular": require("@/assets/fonts/Poppins/Poppins-Regular.ttf"),
        "Poppins-Medium": require("@/assets/fonts/Poppins/Poppins-Medium.ttf"),
        "Poppins-SemiBold": require("@/assets/fonts/Poppins/Poppins-SemiBold.ttf"),
        "Poppins-Bold": require("@/assets/fonts/Poppins/Poppins-Bold.ttf"),
        "Tajawal-Regular": require("@/assets/fonts/Tajawal/Tajawal-Regular.ttf"),
        "Tajawal-Medium": require("@/assets/fonts/Tajawal/Tajawal-Medium.ttf"),
        "Tajawal-Bold": require("@/assets/fonts/Tajawal/Tajawal-Bold.ttf"),
    });

    const isReady = (fontsLoaded || !!fontError) && directionReady && tokenReady;

    // Safety fallback: Ensure RootLayout forces rendering after 1s even if something hangs
    const [safetyReady, setSafetyReady] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setSafetyReady(true);
            SplashScreen.hideAsync();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Hydrate auth token from SecureStore into the in-memory cache so that
    // the synchronous Axios interceptor always finds it on cold start.
    useEffect(() => {
        tokenService.ensureHydrated()
            .then(() => setTokenReady(true))
            .catch((err) => {
                console.error("Token hydration error:", err);
                setTokenReady(true); // Fallback so app doesn't hang
            });
    }, []);

    // Apply the persisted RTL/LTR direction before the first frame renders.
    useEffect(() => {
        loadSavedLanguage()
            .then((lang) => {
                applyRTL(lang);
                setDirectionReady(true);
            })
            .catch((err) => {
                console.error("Language load error:", err);
                applyRTL("ar"); // Fallback
                setDirectionReady(true);
            });
    }, []);

    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync();
        }
    }, [isReady]);

    if (enableClearStorage) AsyncStorage.clear();

    if (!isReady && !safetyReady) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <Providers>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: "flip",
                    }}
                />
            </Providers>
        </GestureHandlerRootView>
    );
}

export default Sentry.wrap(RootLayout);
