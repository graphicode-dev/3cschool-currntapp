import Providers from "@/providers";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
    initialRouteName: "login",
};

export default function RootLayout() {
    return (
        <Providers>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack>
                    <Stack.Screen
                        name="login"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="modal"
                        options={{ presentation: "modal", title: "Modal" }}
                    />
                </Stack>
            </SafeAreaView>
            <StatusBar style="auto" />
        </Providers>
    );
}
