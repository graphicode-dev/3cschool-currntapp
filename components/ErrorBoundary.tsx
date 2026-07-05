import { ThemedText } from "@/components/themed-text";
import { Colors, Palette } from "@/constants/theme";
import * as Updates from "expo-updates";
import React, { Component, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";

interface State {
    hasError: boolean;
    errorMessage: string;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    t: any;
    isDark: boolean;
}

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, State> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            errorMessage: "",
        };
    }

    static getDerivedStateFromError(error: any) {
        return {
            hasError: true,
            errorMessage: error.message || "An unexpected error occurred",
        };
    }

    componentDidCatch(error: any, info: any) {
        console.error("Error caught by ErrorBoundary:", error, info);
    }

    resetError = () => {
        this.setState({ hasError: false, errorMessage: "" });
    };

    render() {
        const { t, isDark } = this.props;
        
        // Colors from theme
        const bgColor = isDark ? Colors.dark.background : Colors.light.background;
        const cardColor = isDark ? "#1E1E1E" : Palette.card;
        const titleColor = Palette.red400;
        const textColor = isDark ? Colors.dark.text : Colors.light.text;

        if (this.state.hasError) {
            return (
                <View style={[styles.container, { backgroundColor: bgColor }]}>
                    <View style={[styles.errorContainer, { backgroundColor: cardColor }]}>
                        <ThemedText style={[styles.errorTitle, { color: titleColor }]}>
                            {t("support.create.error") || "Error"}
                        </ThemedText>
                        <ThemedText style={[styles.errorMessage, { color: textColor }]}>
                            {this.state.errorMessage}
                        </ThemedText>
                        <ThemedText style={[styles.errorMessage, { color: textColor }]}>
                            Something went wrong. Please try restarting the app or contact support if the issue persists.
                        </ThemedText>
                        
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                this.resetError();
                                setTimeout(async () => {
                                    try {
                                        await Updates.reloadAsync();
                                    } catch (e) {
                                        // Fallback if Updates fails
                                    }
                                }, 500);
                            }}
                        >
                            <ThemedText style={styles.buttonText}>
                                Reload App
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

// Wrapper component to provide hooks (translations and theme) to the class component
export default function ErrorBoundary({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    
    return (
        <ErrorBoundaryInner t={t} isDark={colorScheme === "dark"}>
            {children}
        </ErrorBoundaryInner>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorContainer: {
        borderRadius: 12,
        padding: 24,
        width: "90%",
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
        textAlign: "center",
    },
    errorMessage: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        backgroundColor: Palette.brand[500],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        width: "100%",
        marginTop: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
});
