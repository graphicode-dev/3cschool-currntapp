import { Icons } from "@/constants/icons";
import { HomeIcon } from "@/constants/icons/tab.icons";
import { Colors, Palette } from "@/constants/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 76;
const CENTER_BUTTON_OFFSET = 20;

// Responsive sizing based on screen width
const getResponsiveSizes = () => {
    if (SCREEN_WIDTH < 360) {
        return {
            iconSize: 20,
            fontSize: 10,
            badgeSize: 14,
            centerButtonSize: 56,
            tabItemMinWidth: 42,
            sideGroupGap: 8,
            sidePadding: 10,
            centerSpacerExtra: 8,
        };
    } else if (SCREEN_WIDTH < 400) {
        return {
            iconSize: 22,
            fontSize: 11,
            badgeSize: 16,
            centerButtonSize: 60,
            tabItemMinWidth: 48,
            sideGroupGap: 12,
            sidePadding: 16,
            centerSpacerExtra: 10,
        };
    } else {
        return {
            iconSize: 24,
            fontSize: 12,
            badgeSize: 18,
            centerButtonSize: 68,
            tabItemMinWidth: 53,
            sideGroupGap: 21,
            sidePadding: 24,
            centerSpacerExtra: 10,
        };
    }
};

const R = getResponsiveSizes();

const TAB_ORDER = ["groups", "chats", "home", "support", "profile"];

function getTabIcon(routeName: string, color: string) {
    switch (routeName) {
        case "groups":
            return <Icons.GroupsIcon size={R.iconSize} color={color} />;
        case "chats":
            return <Icons.ChatIcon size={R.iconSize} color={color} />;
        case "home":
            return <Icons.HomeIcon size={R.iconSize} color={color} />;
        case "support":
            return <Icons.SupportIcon size={R.iconSize} color={color} />;
        case "profile":
            return <Icons.UserIcon size={R.iconSize} color={color} />;
        default:
            return null;
    }
}

function getTabLabel(routeName: string) {
    switch (routeName) {
        case "support":
            return "Support";
        case "groups":
            return "Groups";
        case "home":
            return "Home";
        case "chats":
            return "Chats";
        case "profile":
            return "Profile";
        default:
            return routeName;
    }
}

const SPRING_CONFIG = { damping: 15, stiffness: 200, mass: 0.5 };

function AnimatedTabItem({
    isFocused,
    routeName,
    selectedColor,
    defaultColor,
    onPress,
    onLongPress,
    badge,
}: {
    isFocused: boolean;
    routeName: string;
    selectedColor: string;
    defaultColor: string;
    onPress: () => void;
    onLongPress: () => void;
    badge?: number;
}) {
    const progress = useSharedValue(isFocused ? 1 : 0);
    const dotScale = useSharedValue(isFocused ? 1 : 0);
    const dotOpacity = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
        dotScale.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
        dotOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    }, [isFocused]);

    const animatedLabelStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            progress.value,
            [0, 1],
            [defaultColor, selectedColor],
        ),
    }));

    const animatedDotStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dotScale.value }],
        opacity: dotOpacity.value,
    }));

    const color = isFocused ? selectedColor : defaultColor;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, { minWidth: R.tabItemMinWidth }]}
        >
            <View>
                {getTabIcon(routeName, color)}
                {!!badge && badge > 0 && (
                    <View
                        style={[
                            styles.badge,
                            { width: R.badgeSize, height: R.badgeSize },
                        ]}
                    >
                        <ThemedText
                            style={[
                                styles.badgeText,
                                { fontSize: R.fontSize - 2 },
                            ]}
                        >
                            {badge > 99 ? "99+" : badge}
                        </ThemedText>
                    </View>
                )}
            </View>
            <Animated.Text
                style={[
                    styles.tabLabel,
                    animatedLabelStyle,
                    { fontSize: R.fontSize },
                ]}
                numberOfLines={1}
            >
                {getTabLabel(routeName)}
            </Animated.Text>
            <Animated.View style={[styles.tabActiveDot, animatedDotStyle]} />
        </TouchableOpacity>
    );
}

function AnimatedCenterDot({ isActive }: { isActive: boolean }) {
    const dotScale = useSharedValue(isActive ? 1 : 0);
    const dotOpacity = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        dotScale.value = withSpring(isActive ? 1 : 0, SPRING_CONFIG);
        dotOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dotScale.value }],
        opacity: dotOpacity.value,
    }));

    return <Animated.View style={[styles.activeDot, animatedStyle]} />;
}

export function CustomTabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const colors = Colors["light"];

    const sortedRoutes = TAB_ORDER.map((name) => {
        const index = state.routes.findIndex((r) => r.name === name);
        return { route: state.routes[index], index };
    }).filter((item) => item.route);

    const centerIndex = sortedRoutes.findIndex(
        (item) => item.route.name === "home",
    );

    const handlePress = (route: any, routeIndex: number) => {
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

    // Center spacer = button size + small extra breathing room
    const centerSpacerWidth = R.centerButtonSize + R.centerSpacerExtra;

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 8 },
            ]}
        >
            <View style={styles.tabBarWrapper}>
                {/* Center raised button */}
                <View style={styles.centerButtonContainer}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            if (centerIndex !== -1) {
                                handlePress(
                                    sortedRoutes[centerIndex].route,
                                    sortedRoutes[centerIndex].index,
                                );
                            }
                        }}
                        onLongPress={() => {
                            if (centerIndex !== -1) {
                                handleLongPress(
                                    sortedRoutes[centerIndex].route,
                                );
                            }
                        }}
                    >
                        <View
                            style={[
                                styles.centerButtonOuter,
                                {
                                    width: R.centerButtonSize,
                                    height: R.centerButtonSize,
                                    borderRadius: R.centerButtonSize / 2,
                                },
                            ]}
                        >
                            <View style={styles.centerButtonBlur}>
                                <LinearGradient
                                    colors={[
                                        Palette.brand[600],
                                        Palette.brand[500],
                                    ]}
                                    start={{ x: 0.3, y: 0 }}
                                    end={{ x: 0.7, y: 1 }}
                                    style={[
                                        styles.centerButtonGradient,
                                        {
                                            borderRadius:
                                                R.centerButtonSize / 2,
                                        },
                                    ]}
                                >
                                    <HomeIcon
                                        size={R.iconSize}
                                        color="#FFFFFF"
                                    />
                                </LinearGradient>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <AnimatedCenterDot
                        isActive={
                            state.index === sortedRoutes[centerIndex]?.index
                        }
                    />
                </View>

                {/* Tab bar pill */}
                <View style={styles.blurContainer}>
                    <View
                        style={[
                            styles.tabBar,
                            {
                                backgroundColor: colors.tabBarBackground,
                                borderColor: colors.tabBarBorder,
                            },
                        ]}
                    >
                        {/*
                         * Use flex layout instead of space-between so each side
                         * gets exactly 50% minus half the spacer — prevents overflow
                         * on narrow Android screens.
                         */}
                        <View
                            style={[
                                styles.tabsContainer,
                                { paddingHorizontal: R.sidePadding },
                            ]}
                        >
                            {/* Left tabs — flex:1 so they take equal share */}
                            <View
                                style={[
                                    styles.sideGroup,
                                    { gap: R.sideGroupGap },
                                ]}
                            >
                                {sortedRoutes
                                    .filter((_, i) => i < centerIndex)
                                    .map((item) => {
                                        const isFocused =
                                            state.index === item.index;
                                        return (
                                            <AnimatedTabItem
                                                key={item.route.key}
                                                isFocused={isFocused}
                                                routeName={item.route.name}
                                                selectedColor={
                                                    colors.tabIconSelected
                                                }
                                                defaultColor={
                                                    colors.tabIconDefault
                                                }
                                                onPress={() =>
                                                    handlePress(
                                                        item.route,
                                                        item.index,
                                                    )
                                                }
                                                onLongPress={() =>
                                                    handleLongPress(item.route)
                                                }
                                            />
                                        );
                                    })}
                            </View>

                            {/* Center spacer — fixed width matching raised button */}
                            <View style={{ width: centerSpacerWidth }} />

                            {/* Right tabs */}
                            <View
                                style={[
                                    styles.sideGroup,
                                    { gap: R.sideGroupGap },
                                ]}
                            >
                                {sortedRoutes
                                    .filter((_, i) => i > centerIndex)
                                    .map((item) => {
                                        const isFocused =
                                            state.index === item.index;
                                        return (
                                            <AnimatedTabItem
                                                key={item.route.key}
                                                isFocused={isFocused}
                                                routeName={item.route.name}
                                                selectedColor={
                                                    colors.tabIconSelected
                                                }
                                                defaultColor={
                                                    colors.tabIconDefault
                                                }
                                                onPress={() =>
                                                    handlePress(
                                                        item.route,
                                                        item.index,
                                                    )
                                                }
                                                onLongPress={() =>
                                                    handleLongPress(item.route)
                                                }
                                            />
                                        );
                                    })}
                            </View>
                        </View>
                    </View>
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
        marginHorizontal: 10,
    },
    tabBarWrapper: {
        width: "100%",
        maxWidth: 411,
        alignItems: "center",
        position: "relative",
    },
    blurContainer: {
        borderRadius: 62,
        overflow: "hidden",
        width: "100%",
    },
    tabBar: {
        height: TAB_BAR_HEIGHT,
        borderRadius: 62,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    tabsContainer: {
        flexDirection: "row",
        alignItems: "center",
        // justifyContent removed — children now lay out via flex naturally
        width: "100%",
        // paddingHorizontal set inline (responsive)
    },
    sideGroup: {
        flex: 1, // ← each side takes equal available space
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around", // spread tabs evenly within their half
        // gap set inline (responsive)
    },
    tabItem: {
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        // minWidth set inline (responsive)
    },
    tabLabel: {
        fontWeight: "500",
        fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
        // fontSize set inline (responsive)
    },
    centerButtonContainer: {
        position: "absolute",
        top: -CENTER_BUTTON_OFFSET,
        zIndex: 10,
        alignItems: "center",
    },
    centerButtonOuter: {
        borderWidth: 1,
        borderColor: "#ECE9E7",
        overflow: "hidden",
        // width, height, borderRadius set inline (responsive)
    },
    centerButtonBlur: {
        width: "100%",
        height: "100%",
    },
    centerButtonGradient: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        // borderRadius set inline (responsive)
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Palette.brand[500],
        marginTop: 6,
    },
    tabActiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Palette.brand[500],
        marginTop: 2,
    },
    badge: {
        position: "absolute",
        top: -5,
        right: -8,
        backgroundColor: "#E53935",
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
        textAlign: "center",
    },
});
