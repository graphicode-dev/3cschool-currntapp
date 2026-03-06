import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

export default function SupportLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ animation: "simple_push" }} />
            <Stack.Screen name="create" options={{ animation: "simple_push" }} />
            <Stack.Screen name="[id]" options={{ animation: "simple_push" }} />
        </Stack>
    );
}
