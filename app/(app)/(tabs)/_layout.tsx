import { CustomTabBar } from "@/components/custom-tab-bar";
import { Tabs } from "expo-router";
import React from "react";

function TabLayoutInner() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                animation: "shift",
            }}
            initialRouteName="home"
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="groups" />
            <Tabs.Screen name="chats" />
            <Tabs.Screen name="support" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}

export default function TabLayout() {
    return <TabLayoutInner />;
}
