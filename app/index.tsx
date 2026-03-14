import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette } from "@/constants/theme";
import { useAuthStore } from "@/services/auth/auth.store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// ─── Scale helpers (design base: 390×844) ───────────────────────────────────
const BASE_W = 390;
const BASE_H = 844;
const sx = (x: number) => (x / BASE_W) * width;
const sy = (y: number) => (y / BASE_H) * height;
const sc = (v: number) => (v / BASE_W) * width;

// ─── Bubble Component ────────────────────────────────────────────────────────
interface BubbleProps {
    size: number; // design px
    left: number; // design px
    top: number; // design px
    label: string;
    labelColor: string;
    rotation: number;
    delay: number;
    bgColor: string;
    fontSize?: number;
}

function Bubble({
    size,
    left,
    top,
    label,
    labelColor,
    rotation,
    delay,
    bgColor,
    fontSize = 20,
}: BubbleProps) {
    const aScale = useRef(new Animated.Value(0)).current;
    const aOpac = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(aScale, {
                toValue: 1,
                delay,
                useNativeDriver: true,
                tension: 60,
                friction: 8,
            }),
            Animated.timing(aOpac, {
                toValue: 1,
                duration: 300,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const sz = sc(size);

    return (
        <Animated.View
            style={{
                position: "absolute",
                width: sz,
                height: sz,
                left: sx(left),
                top: sy(top),
                opacity: aOpac,
                transform: [{ scale: aScale }],
                alignItems: "center",
                justifyContent: "center",
            }}>
            <View
                style={{
                    borderWidth: 1,
                    borderRadius: 100,
                    width: sz,
                    height: sz,
                    transform: [{ rotate: `${rotation}deg` }],
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bgColor,
                }}>
                <ThemedText
                    style={{
                        color: labelColor,
                        fontFamily: "Poppins-Medium",
                        textAlign: "center",
                        lineHeight: sc(fontSize) * 1.35,
                        textTransform: "capitalize",
                    }}
                    fontSize={sc(fontSize)}>
                    {label}
                </ThemedText>
            </View>
        </Animated.View>
    );
}

// ─── Animated Bubble Image Component ───────────────────────────────────────
interface AnimatedBubbleImageProps {
    source: any;
    style: any;
    delay: number;
}

function AnimatedBubbleImage({
    source,
    style,
    delay,
}: AnimatedBubbleImageProps) {
    const aScale = useRef(new Animated.Value(0)).current;
    const aOpac = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(aScale, {
                toValue: 1,
                delay,
                useNativeDriver: true,
                tension: 60,
                friction: 8,
            }),
            Animated.timing(aOpac, {
                toValue: 1,
                duration: 300,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.Image
            source={source}
            style={[style, { opacity: aOpac, transform: [{ scale: aScale }] }]}
            resizeMode="contain"
        />
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SplashScreen() {
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslate = useRef(new Animated.Value(-20)).current;
    const skipOpacity = useRef(new Animated.Value(0)).current;

    const navigateDependingOnAuth = () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
            // Try using push for animation, then replace to clean stack
            router.push("/(app)/(tabs)/home");
        } else {
            router.push("/(auth)/login");
        }
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(titleOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(titleTranslate, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(skipOpacity, {
                toValue: 1,
                duration: 600,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();

        (async () => {
            await new Promise((r) => setTimeout(r, 3000));
            navigateDependingOnAuth();
        })();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Skip button */}
            <Animated.View style={[styles.skipBtn, { opacity: skipOpacity }]}>
                <TouchableOpacity onPress={navigateDependingOnAuth}>
                    <View style={styles.skipBtnContent}>
                        <ThemedText style={styles.skipText} fontSize={sc(15)}>
                            skip
                        </ThemedText>
                        <Icons.ArrowIcon color={Palette.brand[500]} size={20} />
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Headline */}
            <Animated.View
                style={[
                    styles.titleContainer,
                    {
                        opacity: titleOpacity,
                        transform: [{ translateY: titleTranslate }],
                    },
                ]}>
                <ThemedText style={styles.title} fontSize={sc(36)}>
                    Code, Practice, And Level Up—{"\n"}Anytime.
                </ThemedText>
            </Animated.View>

            {/* Student illustration */}
            <View style={styles.illustrationWrap}>
                <Image
                    source={Images.student}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </View>

            {/* Daisy flower */}
            <AnimatedBubbleImage
                source={Images.flower}
                style={styles.daisy}
                delay={600}
            />
            <AnimatedBubbleImage
                source={Images.logo}
                style={styles.daisy}
                delay={650}
            />

            {/* ── Bubbles ── */}
            <Bubble
                bgColor="#e9f7fc"
                size={139}
                left={37}
                top={430}
                label="TechSkills"
                labelColor="#24ADE3"
                rotation={-6.93}
                delay={750}
            />
            <Bubble
                bgColor="#e9f7fc"
                size={27}
                left={10}
                top={530}
                label=""
                labelColor=""
                rotation={-6.93}
                delay={320}
            />
            <Bubble
                bgColor="#fff6e6"
                size={117}
                left={237}
                top={459}
                label="Sessions"
                labelColor="#24ADE3"
                rotation={-6.93}
                delay={580}
            />
            <Bubble
                bgColor="#a7b5ff"
                size={123}
                left={136}
                top={553}
                label="FunCoding"
                labelColor="#E9F7FC"
                rotation={-6.93}
                delay={410}
            />
            <Bubble
                bgColor="#a7b5ff"
                size={27}
                left={170}
                top={690}
                label=""
                labelColor=""
                rotation={-6.93}
                delay={890}
            />
            <Bubble
                bgColor="#bbe6f6"
                size={97}
                left={277}
                top={591}
                label="Progress"
                labelColor="#24ADE3"
                rotation={-12.23}
                delay={230}
                fontSize={16}
            />
            <Bubble
                bgColor="#7a7a7a"
                size={27}
                left={350}
                top={700}
                label=""
                labelColor=""
                rotation={-12.23}
                delay={670}
                fontSize={16}
            />
            <Bubble
                bgColor="#9ad9f2"
                size={27}
                left={192}
                top={508}
                label=""
                labelColor="#FFFFFF"
                rotation={0}
                delay={490}
                fontSize={10}
            />
            <Bubble
                bgColor="#393838"
                size={136}
                left={34}
                top={699}
                label={"Beginner\nFriendly"}
                labelColor="#EBEBEB"
                rotation={-9.5}
                delay={850}
            />
            <Bubble
                bgColor="#e9f7fc"
                size={27}
                left={10}
                top={800}
                label=""
                labelColor=""
                rotation={-6.93}
                delay={360}
            />
            <Bubble
                bgColor="#24ade3"
                size={156}
                left={192}
                top={685}
                label={"Smart\nLearning"}
                labelColor="#E9F7FC"
                rotation={-6.01}
                delay={540}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D6E8F5",
    },
    bgVector1: {
        position: "absolute",
        width: width * 1.35,
        height: height * 0.55,
        top: -height * 0.12,
        left: -width * 0.18,
        opacity: 0.9,
    },
    bgVector2: {
        position: "absolute",
        width: width * 0.9,
        height: height * 0.55,
        bottom: -height * 0.08,
        right: -width * 0.12,
        opacity: 0.9,
    },
    skipBtn: {
        position: "absolute",
        top: sy(46),
        right: sx(20),
        zIndex: 10,
    },
    skipBtnContent: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#24ADE3",
        borderRadius: 35,
        paddingHorizontal: sx(16),
        paddingVertical: sy(7),
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    skipText: {
        color: "#24ADE3",
        fontFamily: "Poppins-Regular",
        textTransform: "capitalize",
    },
    arrowIcon: {
        width: sx(19),
        height: sy(10),
    },
    titleContainer: {
        position: "absolute",
        top: sy(115),
        left: sx(24),
        width: sx(301),
    },
    title: {
        fontFamily: "Poppins-SemiBold",
        color: "#393838",
        lineHeight: sc(44),
    },
    illustrationWrap: {
        position: "absolute",
        // Figma: center x = 390/2 + 70.87 = 265.87, center y = 844/2 - 75.94 = 346.06
        // width 336.54, height 253.13
        left: sx(265.87 - 336.54 / 2),
        top: sy(346.06 - 253.13 / 2),
        width: sx(336.54),
        height: sy(253.13),
        overflow: "hidden",
    },
    illustration: {
        width: "90%",
        height: "100%", // matches Figma overflow
    },
    decorativeVector: {
        position: "absolute",
        // Figma node 159:2106: inset 68.24% top, 69.24% right, 18.86% bottom, 2.66% left
        left: sx(BASE_W * 0.0266),
        top: sy(BASE_H * 0.6824),
        width: sx(BASE_W * (1 - 0.0266 - 0.6924)),
        height: sy(BASE_H * (1 - 0.6824 - 0.1886)),
    },
    daisy: {
        position: "absolute",
        // Figma: left 5.21%, right 71.79% of width  → left = 5.21%, width = ~23%
        left: sx(BASE_W * 0.0521),
        top: sy(584.53),
        width: sx(BASE_W * (1 - 0.0521 - 0.7179)),
        height: sx(BASE_W * (1 - 0.0521 - 0.7179)), // square, aspect 1
    },
    dot: {
        position: "absolute",
        width: sx(23),
        height: sx(23),
    },
});
