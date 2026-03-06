import { Icons } from "@/constants/icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
    LayoutChangeEvent,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = 67;
const ICON_SIZE = 24;
const BORDER_RADIUS = 22;
const TAB_PADDING_H = 8;

const TAB_ORDER = ["home", "groups", "support", "profile"];

function getTabIcon(routeName: string, color: string) {
    switch (routeName) {
        case "home":
            return <Icons.HomeIcon size={ICON_SIZE} color={color} />;
        case "groups":
            return <Icons.GroupsIcon size={ICON_SIZE} color={color} />;
        case "support":
            return <Icons.SupportIcon size={ICON_SIZE} color={color} />;
        case "profile":
            return <Icons.UserIcon size={ICON_SIZE} color={color} />;
        default:
            return null;
    }
}

const SPRING_CONFIG = {
    damping: 20,
    stiffness: 180,
    mass: 0.6,
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    // Track each tab's x position and width after layout
    const [tabLayouts, setTabLayouts] = useState<
        { x: number; width: number }[]
    >([]);
    const containerRef = useRef<View>(null);

    // Animated x position and width of the sliding pill
    const pillX = useSharedValue(0);
    const pillWidth = useSharedValue(0);

    const sortedRoutes = TAB_ORDER.map((name) => {
        const index = state.routes.findIndex((r) => r.name === name);
        return { route: state.routes[index], index };
    }).filter((item) => item.route);

    // When layouts are measured and active index changes → slide the pill
    useEffect(() => {
        const activeRouteIndex = sortedRoutes.findIndex(
            (item) => item.index === state.index,
        );

        if (tabLayouts[activeRouteIndex]) {
            const { x, width } = tabLayouts[activeRouteIndex];

            // 🔥 compensate for tabBar horizontal padding
            pillX.value = withSpring(x - TAB_PADDING_H, SPRING_CONFIG);
            pillWidth.value = withSpring(
                width + TAB_PADDING_H * 2,
                SPRING_CONFIG,
            );
        }
    }, [state.index, tabLayouts]);

    const pillStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: pillX.value }],
        width: pillWidth.value,
    }));

    const handleTabLayout = (index: number) => (e: LayoutChangeEvent) => {
        const { x, width } = e.nativeEvent.layout;
        setTabLayouts((prev) => {
            const next = [...prev];
            next[index] = { x, width };
            return next;
        });
    };

    const handlePress = (route: any) => {
        if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
        });
        if (!event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
        }
    };

    const handleLongPress = (route: any) => {
        navigation.emit({ type: "tabLongPress", target: route.key });
    };

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 8 },
            ]}
        >
            {/* Outer glow ring */}
            <View style={styles.glowRing} />

            {/* Glass pill container */}
            <View style={styles.glassPill} ref={containerRef}>
                {/* Top-edge shimmer */}
                <View style={styles.topHighlight} />

                {/* Sliding active background — rendered BEHIND icons */}
                <Animated.View style={[styles.slidingPill, pillStyle]} />

                {/* Tab items */}
                <View style={styles.tabBar}>
                    {sortedRoutes.map((item, i) => {
                        const isFocused = state.index === item.index;
                        const color = isFocused ? "#FFFFFF" : "#616060";

                        return (
                            <TouchableOpacity
                                key={item.route.key}
                                activeOpacity={0.8}
                                onPress={() => handlePress(item.route)}
                                onLongPress={() => handleLongPress(item.route)}
                                onLayout={handleTabLayout(i)}
                                style={styles.tabItem}
                            >
                                {getTabIcon(item.route.name, color)}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        marginHorizontal: 24,
    },

    glowRing: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: TAB_BAR_HEIGHT,
        borderRadius: BORDER_RADIUS + 2,
        backgroundColor: "transparent",
        shadowColor: "#24ADE3",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
    },

    glassPill: {
        width: "100%",
        height: TAB_BAR_HEIGHT,
        borderRadius: BORDER_RADIUS,
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        borderWidth: 1,
        borderColor: "#BBE6F6",
        overflow: "hidden",
        shadowColor: "#7DC8E8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
        elevation: 8,
        // position context for the absolute sliding pill
        position: "relative",
    },

    topHighlight: {
        position: "absolute",
        top: 0,
        left: 16,
        right: 16,
        height: 1,
        borderRadius: 1,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 2,
    },

    // The sliding blue pill — absolutely positioned, fills full height
    slidingPill: {
        position: "absolute",
        top: 0,
        left: 0,
        height: TAB_BAR_HEIGHT,
        borderRadius: BORDER_RADIUS,
        backgroundColor: "#50BDE9",
        zIndex: 1,
        // Soft glow on the active pill
        shadowColor: "#24ADE3",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },

    tabBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: TAB_PADDING_H,
        zIndex: 3, // above the sliding pill so icons are always visible
    },

    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: TAB_BAR_HEIGHT,
    },
});
