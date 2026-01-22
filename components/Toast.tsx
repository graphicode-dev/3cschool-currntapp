import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export type ToastType = "info" | "success" | "warning" | "error";

interface ToastProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: ToastType;
    duration?: number;
    onDismiss: () => void;
    onPress?: () => void;
}

function getToastConfig(type: ToastType) {
    switch (type) {
        case "success":
            return {
                icon: "checkmark-circle" as const,
                color: "#10b981",
                bg: "#dcfce7",
                borderColor: "#86efac",
            };
        case "warning":
            return {
                icon: "alert-circle" as const,
                color: "#f59e0b",
                bg: "#fef3c7",
                borderColor: "#fcd34d",
            };
        case "error":
            return {
                icon: "close-circle" as const,
                color: "#ef4444",
                bg: "#fee2e2",
                borderColor: "#fca5a5",
            };
        case "info":
        default:
            return {
                icon: "notifications" as const,
                color: "#00aeed",
                bg: "#e6f7fd",
                borderColor: "#bae6fd",
            };
    }
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    title,
    message,
    type = "info",
    duration = 4000,
    onDismiss,
    onPress,
}) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const config = getToastConfig(type);

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 10,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.toast,
                    {
                        backgroundColor: config.bg,
                        borderColor: config.borderColor,
                    },
                ]}
                activeOpacity={0.9}
                onPress={onPress || handleDismiss}
            >
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: config.color + "20" },
                    ]}
                >
                    <Ionicons
                        name={config.icon}
                        size={24}
                        color={config.color}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    {message && (
                        <Text style={styles.message} numberOfLines={2}>
                            {message}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
    },
    toast: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    message: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 18,
    },
    closeButton: {
        padding: 4,
    },
});

export default Toast;
