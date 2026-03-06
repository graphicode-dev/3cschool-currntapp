import { Palette } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

type SkeletonProps = {
    style?: any;
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
};

export const Skeleton: React.FC<SkeletonProps> = ({
    style,
    width = "100%",
    height = 20,
    borderRadius = 4,
}) => {
    const opacity = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        );

        pulseAnimation.start();

        return () => pulseAnimation.stop();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: Palette.slate200,
    },
});
