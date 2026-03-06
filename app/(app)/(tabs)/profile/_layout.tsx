import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ animation: "simple_push" }} />
            <Stack.Screen name="edit" options={{ animation: "simple_push" }} />
        </Stack>
    );
}
