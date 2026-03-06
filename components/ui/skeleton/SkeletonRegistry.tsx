// SkeletonRegistry.tsx

import { Radii, Spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

export type SkeletonType = "program-card";

export const SkeletonRegistry: Record<SkeletonType, React.FC> = {
    "program-card": () => (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Skeleton width={80} height={20} borderRadius={4} />
                    <Skeleton width={120} height={16} borderRadius={4} />
                </View>
                <View style={styles.buttonContainer}>
                    <Skeleton width={64} height={24} borderRadius={12} />
                    <Skeleton width={44} height={24} borderRadius={12} />
                </View>
            </View>
        </View>
    ),
};

const styles = StyleSheet.create({
    card: {
        padding: Spacing.md,
        borderRadius: Radii.xl,
        borderWidth: 1,
        borderColor: "#E2E8F0", // slate200
        backgroundColor: "#FFFFFF",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    textContainer: {
        flex: 1,
        gap: Spacing.xs,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
});
