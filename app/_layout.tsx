import { applyRTL, loadSavedLanguage } from "@/i18n";
import Providers from "@/providers";
import { tokenService } from "@/services/auth/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const enableClearStorage = false;

    // Both must be true before we render — prevents screens from firing
    // API requests before the auth token is in the in-memory cache.
    const [directionReady, setDirectionReady] = useState(false);
    const [tokenReady, setTokenReady] = useState(false);

    const [fontsLoaded] = useFonts({
        "Poppins-Regular": require("@/assets/fonts/Poppins/Poppins-Regular.ttf"),
        "Poppins-Medium": require("@/assets/fonts/Poppins/Poppins-Medium.ttf"),
        "Poppins-SemiBold": require("@/assets/fonts/Poppins/Poppins-SemiBold.ttf"),
        "Poppins-Bold": require("@/assets/fonts/Poppins/Poppins-Bold.ttf"),
        "Tajawal-Regular": require("@/assets/fonts/Tajawal/Tajawal-Regular.ttf"),
        "Tajawal-Medium": require("@/assets/fonts/Tajawal/Tajawal-Medium.ttf"),
        "Tajawal-Bold": require("@/assets/fonts/Tajawal/Tajawal-Bold.ttf"),
    });

    // Hydrate auth token from SecureStore into the in-memory cache so that
    // the synchronous Axios interceptor always finds it on cold start.
    useEffect(() => {
        tokenService.ensureHydrated().then(() => setTokenReady(true));
    }, []);

    // Apply the persisted RTL/LTR direction before the first frame renders.
    useEffect(() => {
        loadSavedLanguage().then((lang) => {
            applyRTL(lang);
            setDirectionReady(true);
        });
    }, []);

    useEffect(() => {
        if (fontsLoaded && directionReady && tokenReady) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, directionReady, tokenReady]);

    if (enableClearStorage) AsyncStorage.clear();

    if (!fontsLoaded || !directionReady || !tokenReady) return null;

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
