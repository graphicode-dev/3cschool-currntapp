import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette } from "@/constants/theme";
import { useAuthStore } from "@/services/auth/auth.store";
import {
    horizontalScale as hs,
    moderateScale as ms,
    verticalScale as vs,
} from "@/utils/responsiveSize";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Bubble Component ────────────────────────────────────────────────────────
interface BubbleProps {
    size: number;
    left: number;
    top: number;
    label: string;
    labelColor: string;
    rotation: number;
    delay: number;
    bgColor: string;
    fontSize?: number;
    borderColor?: string;
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
    fontSize = 14,
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

    const sz = hs(size);

    return (
        <Animated.View
            style={{
                position: "absolute",
                width: sz,
                height: sz,
                left: hs(left),
                top: vs(top),
                opacity: aOpac,
                transform: [{ scale: aScale }],
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <View
                style={{
                    borderWidth: 2,
                    borderColor: "black",
                    borderRadius: sz / 2,
                    width: sz,
                    height: sz,
                    transform: [{ rotate: `${rotation}deg` }],
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bgColor,
                }}
            >
                {label ? (
                    <ThemedText
                        style={{
                            color: labelColor,
                            fontFamily: "Poppins-Medium",
                            textAlign: "center",
                            textTransform: "capitalize",
                        }}
                        fontSize={ms(fontSize)}
                    >
                        {label}
                    </ThemedText>
                ) : null}
            </View>
        </Animated.View>
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
        <ImageBackground source={Images.splashBg} style={styles.container}>
            <StatusBar style="auto" />

            {/* Logo */}
            <Image source={Images.logo} style={styles.headerLogo} />

            {/* Skip button */}
            <Animated.View style={[styles.skipBtn, { opacity: skipOpacity }]}>
                <TouchableOpacity onPress={navigateDependingOnAuth}>
                    <View style={styles.skipBtnContent}>
                        <ThemedText style={styles.skipText} fontSize={ms(13)}>
                            skip
                        </ThemedText>
                        <Icons.ArrowIcon color={Palette.brand[500]} size={16} />
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
                ]}
            >
                <ThemedText style={styles.title} fontSize={ms(32)}>
                    <ThemedText
                        style={[styles.title, { color: Palette.brand[500] }]}
                        fontSize={ms(32)}
                    >
                        Code
                    </ThemedText>
                    {", Practice, And\nLevel Up—"}
                    <ThemedText
                        style={[styles.title, { color: Palette.brand[500] }]}
                        fontSize={ms(32)}
                    >
                        Anytime.
                    </ThemedText>
                </ThemedText>
            </Animated.View>

            {/* Girl in circle — bottom-left, partially behind bubbles */}
            <Image
                source={Images.girl}
                style={styles.illustration}
                resizeMode="cover"
            />

            {/* ── Bubbles (right cluster) ── */}

            {/* Sessions - top right */}
            <Bubble
                bgColor="#fff6e6"
                size={90}
                left={220}
                top={340}
                label="Sessions"
                labelColor="#24ADE3"
                rotation={-6.93}
                delay={580}
                fontSize={13}
            />

            {/* Progress - right of FunCoding */}
            <Bubble
                bgColor="#c8eaf6"
                size={95}
                left={265}
                top={450}
                label="Progress"
                labelColor="#24ADE3"
                rotation={-12.23}
                delay={230}
                fontSize={12}
            />

            {/* FunCoding - center */}
            <Bubble
                bgColor="#a7b5ff"
                size={130}
                left={125}
                top={425}
                label="FunCoding"
                labelColor="#ffffff"
                rotation={-6.93}
                delay={410}
                fontSize={13}
            />

            {/* TechSkills - left of sessions */}
            <Bubble
                bgColor="#e9f7fc"
                size={100}
                left={15}
                top={470}
                label="TechSkills"
                labelColor="#24ADE3"
                rotation={-6.93}
                delay={750}
                fontSize={13}
            />

            {/* Beginner Friendly - bottom left */}
            <Bubble
                bgColor="#393838"
                size={150}
                left={20}
                top={600}
                label={"Beginner\nFriendly"}
                labelColor="#EBEBEB"
                rotation={-9.5}
                delay={850}
                fontSize={13}
            />

            {/* Smart Learning - bottom center */}
            <Bubble
                bgColor="#24ade3"
                size={180}
                left={180}
                top={570}
                label={"Smart\nLearning"}
                labelColor="#E9F7FC"
                rotation={-6.01}
                delay={540}
                fontSize={14}
            />

            {/* ── Decorative small dots ── */}
            <Bubble
                bgColor="#9AD9F2"
                size={30}
                left={180}
                top={370}
                label=""
                labelColor=""
                rotation={0}
                delay={320}
            />
            <Bubble
                bgColor="#D7DDFF"
                size={25}
                left={340}
                top={400}
                label=""
                labelColor=""
                rotation={0}
                delay={490}
            />
            <Bubble
                bgColor="#7A7A7A"
                size={25}
                left={330}
                top={570}
                label=""
                labelColor=""
                rotation={0}
                delay={490}
            />
            <Bubble
                bgColor="#9AD9F2"
                size={25}
                left={340}
                top={770}
                label=""
                labelColor=""
                rotation={0}
                delay={490}
            />
            <Bubble
                bgColor="#A7B5FF"
                size={30}
                left={155}
                top={595}
                label=""
                labelColor=""
                rotation={0}
                delay={320}
            />
            <Bubble
                bgColor="#E9F7FC"
                size={25}
                left={10}
                top={770}
                label=""
                labelColor=""
                rotation={0}
                delay={490}
            />
            <Bubble
                bgColor="#24ADE3"
                size={25}
                left={10}
                top={450}
                label=""
                labelColor=""
                rotation={0}
                delay={490}
            />
            <Bubble
                bgColor="#E9F7FC"
                size={25}
                left={100}
                top={460}
                label=""
                labelColor=""
                rotation={0}
                delay={490}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerLogo: {
        position: "absolute",
        top: vs(32),
        left: hs(16),
        zIndex: 10,
        width: hs(74),
        height: vs(80),
        resizeMode: "contain",
    },
    skipBtn: {
        position: "absolute",
        top: vs(52),
        right: hs(16),
        zIndex: 10,
    },
    skipBtnContent: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#24ADE3",
        borderRadius: 35,
        paddingHorizontal: hs(14),
        paddingVertical: vs(6),
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    skipText: {
        color: "#24ADE3",
        fontFamily: "Poppins-Regular",
        textTransform: "capitalize",
    },
    titleContainer: {
        position: "absolute",
        top: vs(118),
        left: hs(16),
        right: hs(16),
    },
    title: {
        fontFamily: "Poppins-SemiBold",
        color: "#393838",
        lineHeight: ms(36),
    },
    // Girl circle: sits left, overlaps the bubble area slightly
    illustration: {
        width: hs(200),
        height: hs(200),
        position: "absolute",
        top: vs(200),
        left: hs(0),
        zIndex: 5,
    },
});
