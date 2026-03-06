import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

interface ErrorProps {
    message: string;
    style?: object;
}

export const Error: React.FC<ErrorProps> = ({ message, style }) => {
    return (
        <View style={[styles.container, style]}>
            <ThemedText style={styles.errorText}>{message}</ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffebee",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#f44336",
        marginVertical: 8,
    },
    errorText: {
        color: "#d32f2f",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
});
