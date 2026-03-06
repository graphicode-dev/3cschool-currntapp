import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

export default function HomeLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ animation: "simple_push" }} />
        </Stack>
    );
}
