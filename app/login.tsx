import { useAppDispatch, useAppSelector } from "@/store";
import { clearError, loginUser } from "@/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {
        isLoading,
        error: authError,
        isAuthenticated,
    } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Navigate when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/welcome");
        }
    }, [isAuthenticated, router]);

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleLogin = () => {
        setLocalError(null);
        dispatch(clearError());

        if (!email.trim()) {
            setLocalError("Please enter your email");
            return;
        }
        if (!password.trim()) {
            setLocalError("Please enter your password");
            return;
        }

        dispatch(loginUser({ email, password }));
    };

    const error = localError || authError;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("@/assets/images/3c-logo.png")}
                            style={styles.logo}
                            contentFit="contain"
                        />
                    </View>

                    {/* Header Text */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Login to your Account</Text>
                        <Text style={styles.subtitle}>
                            Enter your email and password to log in
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Email Field */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Password Field */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    <Ionicons
                                        name={
                                            showPassword
                                                ? "eye-outline"
                                                : "eye-off-outline"
                                        }
                                        size={20}
                                        color="#acb5bb"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons
                                name="alert-circle"
                                size={18}
                                color="#dc2626"
                            />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            isLoading ? styles.loginButtonDisabled : null,
                        ]}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Log In</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    logoContainer: {
        marginTop: 24,
    },
    logo: {
        width: 120,
        height: 46,
    },
    headerContainer: {
        marginTop: 24,
        gap: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#111827",
        lineHeight: 44,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "400",
        color: "#6b7280",
        lineHeight: 20,
    },
    formContainer: {
        marginTop: 54,
        gap: 16,
    },
    inputGroup: {
        gap: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
        lineHeight: 21,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        height: 46,
        paddingHorizontal: 14,
        shadowColor: "#e4e5e7",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.24,
        shadowRadius: 2,
        elevation: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: "400",
        color: "#111827",
        lineHeight: 16,
    },
    eyeButton: {
        padding: 4,
    },
    forgotPasswordContainer: {
        alignItems: "flex-end",
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#00aeed",
        lineHeight: 16,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 16,
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: "#dc2626",
        lineHeight: 20,
    },
    loginButton: {
        backgroundColor: "#00aeed",
        borderRadius: 10,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        marginHorizontal: 8,
    },
    loginButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        lineHeight: 26,
    },
    signUpContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 48,
    },
    signUpText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#6b7280",
        lineHeight: 20,
    },
    signUpLink: {
        fontSize: 14,
        fontWeight: "600",
        color: "#00aeed",
        lineHeight: 20,
        letterSpacing: -0.14,
    },
});
