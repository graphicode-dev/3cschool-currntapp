import { Icons } from "@/constants/icons";
import { Palette, Radii } from "@/constants/theme";
import React, { useState } from "react";
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface AuthInputProps extends TextInputProps {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    isPassword?: boolean;
}

export default function AuthInput({
    label,
    icon,
    error,
    isPassword,
    style,
    secureTextEntry,
    ...props
}: AuthInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isSecure = isPassword || secureTextEntry;

    return (
        <View style={styles.container}>
            <View
                style={[styles.inputRow, error ? styles.inputRowError : null]}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={Palette.brand[300]}
                    secureTextEntry={isSecure && !showPassword}
                    {...props}
                />
                {isSecure && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                        style={styles.eyeButton}
                    >
                        {showPassword ? (
                            <Icons.EyeIcon size={20} color={Palette.slate600} />
                        ) : (
                            <Icons.EyeOffIcon
                                size={20}
                                color={Palette.slate600}
                            />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.labelContainer}>
                <ThemedText style={styles.label}>{label}</ThemedText>
            </View>
            {error ? (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Palette.card,
        borderWidth: 1.166,
        borderColor: Palette.brand[50],
        borderRadius: Radii.lg + 4,
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: 10,
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Palette.brand[500],
        padding: 0,
    },
    inputRowError: {
        borderColor: "#E53935",
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        color: "#E53935",
        marginTop: 4,
        marginLeft: 4,
    },
    labelContainer: {
        position: "absolute",
        top: -10,
        left: 10,
        backgroundColor: "#FDF7EE",
        paddingHorizontal: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: Palette.brand[500],
        lineHeight: 21,
    },
});
