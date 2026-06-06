import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

export default function PlaylistLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[id]" options={{ animation: "simple_push" }} />
        </Stack>
    );
}
