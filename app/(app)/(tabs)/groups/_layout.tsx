import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

export default function GroupsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ animation: "simple_push" }} />
            <Stack.Screen name="[id]" options={{ animation: "simple_push" }} />
            <Stack.Screen
                name="chat/group"
                options={{ animation: "simple_push" }}
            />
            <Stack.Screen
                name="chat/instructor"
                options={{ animation: "simple_push" }}
            />
        </Stack>
    );
}
