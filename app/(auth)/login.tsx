import { ThemedText } from "@/components/themed-text";
import { useLogin } from "@/services/auth";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { toast } from "@/components/ui/Toast";
import { Images } from "@/constants/images";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { mutateAsync: login, isPending } = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        await login(
            {
                email: data.email.trim(),
                password: data.password,
            },
            {
                onSuccess: () => {
                    toast.success(t("auth.success"), "Login successful");
                },
                onError: (error) => {
                    console.error("Login error:", error);
                    toast.error(
                        t("auth.error"),
                        error?.message || "Login failed",
                    );
                },
            },
        );
    };

    return (
        <LinearGradient
            colors={["#E3F2FD", "#BBDEFB", "#90CAF9"]}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <ThemedText
                            type="title"
                            lang="en"
                            style={styles.welcomeText}
                        >
                            Welcome! Let&apos;s Start
                        </ThemedText>
                        <ThemedText
                            type="title"
                            lang="en"
                            style={styles.codingText}
                        >
                            Coding Together!{" "}
                            <ThemedText style={styles.sparkle}>✨</ThemedText>
                        </ThemedText>
                        <ThemedText style={styles.subtitle}>
                            enter your email and password to log in
                        </ThemedText>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <ThemedText
                            type="defaultSemiBold"
                            lang="en"
                            style={styles.label}
                        >
                            Email
                        </ThemedText>
                        <View style={styles.inputContainer}>
                            <Controller
                                control={control}
                                name="email"
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email format",
                                    },
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="student@email.com"
                                            placeholderTextColor="#999"
                                            value={value}
                                            onChangeText={onChange}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        <FontAwesome
                                            name="envelope"
                                            size={20}
                                            color="#666"
                                            style={styles.inputIcon}
                                        />
                                    </>
                                )}
                            />
                        </View>
                        {errors.email && (
                            <ThemedText style={styles.errorText}>
                                {errors.email.message}
                            </ThemedText>
                        )}

                        <ThemedText
                            type="defaultSemiBold"
                            lang="en"
                            style={styles.label}
                        >
                            Password
                        </ThemedText>
                        <View style={styles.inputContainer}>
                            <Controller
                                control={control}
                                name="password"
                                rules={{
                                    required: "Password is required",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="**********"
                                            placeholderTextColor="#999"
                                            value={value}
                                            onChangeText={onChange}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            style={styles.inputIcon}
                                        >
                                            <FontAwesome
                                                name={
                                                    showPassword
                                                        ? "eye"
                                                        : "eye-slash"
                                                }
                                                size={20}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </>
                                )}
                            />
                        </View>
                        {errors.password && (
                            <ThemedText style={styles.errorText}>
                                {errors.password.message}
                            </ThemedText>
                        )}

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isPending}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                lang="en"
                                style={styles.loginButtonText}
                            >
                                {isPending ? "Logging in..." : "Log In"}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <View style={styles.logoContainer}>
                            <Image source={Images.logo} style={styles.logo} />
                            <ThemedText style={styles.bottomText}>
                                Made Especially For Kids To Learn Coding Safely.
                            </ThemedText>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    headerSection: {
        marginTop: 60,
        alignItems: "center",
        marginBottom: 60,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1A1A2E",
        textAlign: "center",
        lineHeight: 40,
        marginBottom: 8,
    },
    codingText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1A1A2E",
        textAlign: "center",
        lineHeight: 40,
        marginBottom: 16,
    },
    sparkle: {
        fontSize: 32,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
    formSection: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    inputContainer: {
        position: "relative",
        marginBottom: 24,
    },
    input: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIcon: {
        position: "absolute",
        right: 16,
        top: 20,
    },
    errorText: {
        color: "#FF6B6B",
        fontSize: 14,
        marginTop: -16,
        marginBottom: 8,
    },
    loginButton: {
        backgroundColor: "#393838",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
    },
    bottomSection: {
        alignItems: "flex-start",
        marginTop: 60,
    },
    logoContainer: {
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 30,
        height: 30,
        borderRadius: 12,
        marginRight: 0,
    },
    bottomText: {
        fontSize: 12,
        color: "#666",
        flex: 1,
        lineHeight: 16,
    },
});
