import { Palette, Spacing } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export const Loading = () => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Palette.brand[500]} />
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        paddingVertical: Spacing.lg,
        alignItems: "center",
    },
});
