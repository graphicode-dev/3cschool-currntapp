import React from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface SweetAlertProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: "delete" | "warning" | "info";
}

const SweetAlert: React.FC<SweetAlertProps> = ({
    visible,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    type = "delete",
}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getColors = () => {
        switch (type) {
            case "delete":
                return {
                    icon: "🗑️",
                    iconBg: "#fee2e2",
                    confirmBg: "#ef4444",
                    confirmText: "#ffffff",
                };
            case "warning":
                return {
                    icon: "⚠️",
                    iconBg: "#fef3c7",
                    confirmBg: "#f59e0b",
                    confirmText: "#ffffff",
                };
            default:
                return {
                    icon: "ℹ️",
                    iconBg: "#dbeafe",
                    confirmBg: "#3b82f6",
                    confirmText: "#ffffff",
                };
        }
    };

    const colors = getColors();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}>
                    {/* Icon */}
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: colors.iconBg },
                        ]}>
                        <ThemedText fontSize={24}>{colors.icon}</ThemedText>
                    </View>

                    {/* Title */}
                    <ThemedText style={styles.title} fontSize={18}>
                        {title}
                    </ThemedText>

                    {/* Message */}
                    <ThemedText style={styles.message} fontSize={14}>
                        {message}
                    </ThemedText>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.8}>
                            <ThemedText
                                style={styles.cancelButtonText}
                                fontSize={14}>
                                {cancelText}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: colors.confirmBg },
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.8}>
                            <ThemedText
                                style={[
                                    styles.confirmButtonText,
                                    { color: colors.confirmText },
                                ]}
                                fontSize={14}>
                                {confirmText}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    alertContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        minWidth: 300,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontWeight: "700",
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    confirmButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cancelButtonText: {
        fontWeight: "600",
        color: "#374151",
    },
    confirmButtonText: {
        fontWeight: "600",
    },
});

export default SweetAlert;
