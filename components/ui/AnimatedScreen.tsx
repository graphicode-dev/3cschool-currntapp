import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

interface AnimatedScreenProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    delay?: number;
}

export function AnimatedScreenFadeIn({ children, style, delay = 0 }: AnimatedScreenProps) {
    return (
        <Animated.View entering={FadeIn.duration(400).delay(delay)} style={[{ flex: 1 }, style]}>
            {children}
        </Animated.View>
    );
}

export function AnimatedSlideUp({ children, style, delay = 0 }: AnimatedScreenProps) {
    return (
        <Animated.View entering={FadeInUp.duration(500).delay(delay).springify().damping(18)} style={style}>
            {children}
        </Animated.View>
    );
}

export function AnimatedSlideDown({ children, style, delay = 0 }: AnimatedScreenProps) {
    return (
        <Animated.View entering={FadeInDown.duration(500).delay(delay).springify().damping(18)} style={style}>
            {children}
        </Animated.View>
    );
}

export function AnimatedFadeIn({ children, style, delay = 0 }: AnimatedScreenProps) {
    return (
        <Animated.View entering={FadeIn.duration(450).delay(delay)} style={style}>
            {children}
        </Animated.View>
    );
}
