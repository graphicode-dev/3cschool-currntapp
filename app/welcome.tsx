import { useAppSelector } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BASE_URL = "https://3cschool.net";

function getInitials(name: string): string {
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(avatarSettings: string | null): string {
    if (!avatarSettings) return "#00aeed";
    try {
        const settings = JSON.parse(avatarSettings);
        return `#${settings.background || "00aeed"}`;
    } catch {
        return "#00aeed";
    }
}

function getGradeName(gradeId: number): string {
    const gradeMap: Record<number, string> = {
        1: "Grade 1",
        2: "Grade 2",
        3: "Grade 3",
        4: "Grade 4",
        5: "Grade 5",
        6: "Grade 6",
        7: "Grade 7",
        8: "Grade 8",
        9: "Grade 9",
        10: "Grade 10",
        11: "Grade 11",
        12: "Grade 12",
    };
    return gradeMap[gradeId] || `Grade ${gradeId}`;
}

export default function WelcomeScreen() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const avatarColor = getAvatarColor(user?.avatar_settings || null);
    const initials = getInitials(user?.full_name || "Student");
    const hasAvatar = user?.avatar;

    // Animations
    const avatarScale = useSharedValue(0);
    const avatarOpacity = useSharedValue(0);
    const cardTranslateY = useSharedValue(50);
    const cardOpacity = useSharedValue(0);
    const buttonTranslateY = useSharedValue(30);
    const buttonOpacity = useSharedValue(0);
    const welcomeOpacity = useSharedValue(0);
    const welcomeTranslateY = useSharedValue(-20);

    useEffect(() => {
        // Welcome text animation
        welcomeOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
        welcomeTranslateY.value = withDelay(100, withSpring(0));

        // Avatar animation
        avatarScale.value = withDelay(300, withSpring(1, { damping: 12 }));
        avatarOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

        // Card animation
        cardTranslateY.value = withDelay(500, withSpring(0, { damping: 15 }));
        cardOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

        // Button animation
        buttonTranslateY.value = withDelay(700, withSpring(0));
        buttonOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    }, []);

    const welcomeAnimatedStyle = useAnimatedStyle(() => ({
        opacity: welcomeOpacity.value,
        transform: [{ translateY: welcomeTranslateY.value }],
    }));

    const avatarAnimatedStyle = useAnimatedStyle(() => ({
        opacity: avatarOpacity.value,
        transform: [{ scale: avatarScale.value }],
    }));

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ translateY: cardTranslateY.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ translateY: buttonTranslateY.value }],
    }));

    const handleContinue = () => {
        router.replace("/(tabs)/chats");
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0ea5e9", "#0284c7", "#0369a1"]}
                style={styles.gradientTop}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Welcome Header */}
                    <Animated.View style={[styles.welcomeHeader, welcomeAnimatedStyle]}>
                        <Text style={styles.welcomeSubtext}>Hello there!</Text>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                    </Animated.View>

                    {/* Avatar with glow effect */}
                    <Animated.View style={[styles.avatarWrapper, avatarAnimatedStyle]}>
                        <View style={styles.avatarGlow} />
                        <View style={styles.avatarContainer}>
                            {hasAvatar ? (
                                <Image
                                    source={{ uri: `${BASE_URL}${user.avatar}` }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                />
                            ) : (
                                <LinearGradient
                                    colors={[avatarColor, shadeColor(avatarColor, -20)]}
                                    style={styles.avatarPlaceholder}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.avatarInitials}>{initials}</Text>
                                </LinearGradient>
                            )}
                        </View>
                        <View style={styles.onlineIndicator} />
                    </Animated.View>

                    {/* Info Card */}
                    <Animated.View style={[styles.infoCard, cardAnimatedStyle]}>
                        <View style={styles.cardContent}>
                            <Text style={styles.nameText}>
                                {user?.full_name || "Student"}
                            </Text>

                            <View style={styles.divider} />

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <View style={styles.statIconContainer}>
                                        <Ionicons
                                            name="school"
                                            size={20}
                                            color="#0ea5e9"
                                        />
                                    </View>
                                    <Text style={styles.statLabel}>Grade</Text>
                                    <Text style={styles.statValue}>
                                        {getGradeName(user?.grade_id || 0)}
                                    </Text>
                                </View>

                                <View style={styles.statDivider} />

                                <View style={styles.statItem}>
                                    <View style={styles.statIconContainer}>
                                        <Ionicons
                                            name="ribbon"
                                            size={20}
                                            color="#10b981"
                                        />
                                    </View>
                                    <Text style={styles.statLabel}>Status</Text>
                                    <Text style={[styles.statValue, { color: "#10b981" }]}>
                                        Active
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Continue Button */}
                    <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinue}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={["#0ea5e9", "#0284c7"]}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.continueButtonText}>
                                    Let's Get Started
                                </Text>
                                <View style={styles.buttonIconContainer}>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={20}
                                        color="#0284c7"
                                    />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
}

function shadeColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
        "#" +
        (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
            .toString(16)
            .slice(1)
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    gradientTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 320,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    welcomeHeader: {
        alignItems: "center",
        marginBottom: 32,
    },
    welcomeSubtext: {
        fontSize: 16,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 4,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: -0.5,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: 32,
    },
    avatarGlow: {
        position: "absolute",
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        borderRadius: 80,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: "hidden",
        borderWidth: 5,
        borderColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        fontSize: 48,
        fontWeight: "700",
        color: "#ffffff",
    },
    onlineIndicator: {
        position: "absolute",
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#22c55e",
        borderWidth: 4,
        borderColor: "#ffffff",
    },
    infoCard: {
        width: width - 48,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        shadowColor: "#0ea5e9",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
        marginBottom: 32,
    },
    cardContent: {
        padding: 24,
    },
    nameText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center",
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#e2e8f0",
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#f0f9ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#94a3b8",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
    },
    statDivider: {
        width: 1,
        height: 60,
        backgroundColor: "#e2e8f0",
        marginHorizontal: 16,
    },
    buttonWrapper: {
        width: "100%",
        paddingHorizontal: 8,
    },
    continueButton: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#0ea5e9",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 32,
        gap: 12,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        letterSpacing: 0.3,
    },
    buttonIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
    },
});
