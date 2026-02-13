import { CreateTicketRequest, ticketsService } from "@/services/ticketsService";
import { useAppSelector } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

type Priority = "low" | "medium" | "high";

export default function CreateTicketScreen() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get the first group ID from user's groups (you may need to adjust this)
    const courseGroupId = 1; // This should come from the selected group or user's current group

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            const ticketData: CreateTicketRequest = {
                course_group_id: courseGroupId,
                title: title.trim(),
                description: description.trim(),
                priority,
            };

            const response = await ticketsService.createTicket(ticketData);

            if (response.code === 200 || response.code === 201) {
                Alert.alert(
                    "Success",
                    "Your ticket has been submitted successfully.",
                    [{ text: "OK", onPress: () => router.back() }],
                );
            } else {
                Alert.alert(
                    "Error",
                    response.message || "Failed to create ticket",
                );
            }
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "Failed to create ticket. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Ticket</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Title</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Brief description of your issue"
                                placeholderTextColor="rgba(46, 46, 46, 0.5)"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    {/* Description Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Description</Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Please describe your issue in detail..."
                                placeholderTextColor="rgba(46, 46, 46, 0.5)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Priority Field */}
                    {/* <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.priorityContainer}>
                            {(["low", "medium", "high"] as Priority[]).map(
                                (p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.priorityButton,
                                            priority === p &&
                                                styles.priorityButtonActive,
                                            p === "high" &&
                                                priority === p &&
                                                styles.priorityButtonHigh,
                                        ]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text
                                            style={[
                                                styles.priorityButtonText,
                                                priority === p &&
                                                    styles.priorityButtonTextActive,
                                            ]}
                                        >
                                            {p.charAt(0).toUpperCase() +
                                                p.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ),
                            )}
                        </View>
                    </View> */}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!title.trim() ||
                                !description.trim() ||
                                isSubmitting) &&
                                styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={
                            !title.trim() || !description.trim() || isSubmitting
                        }
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Submit Ticket
                            </Text>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#ffffff",
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 40,
        gap: 24,
    },
    fieldContainer: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2e2e2e",
        lineHeight: 26,
    },
    inputContainer: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        height: 60,
        justifyContent: "center",
    },
    input: {
        fontSize: 16,
        fontWeight: "400",
        color: "#111827",
        flex: 1,
        padding: 0,
        margin: 0,
    },
    textAreaContainer: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 169,
    },
    textArea: {
        fontSize: 16,
        fontWeight: "400",
        color: "#2e2e2e",
        lineHeight: 26,
        flex: 1,
    },
    priorityContainer: {
        flexDirection: "row",
        gap: 12,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
        alignItems: "center",
    },
    priorityButtonActive: {
        borderColor: "#00aeed",
        backgroundColor: "#e6f7fd",
    },
    priorityButtonHigh: {
        borderColor: "#dc2626",
        backgroundColor: "#fef2f2",
    },
    priorityButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6b7280",
    },
    priorityButtonTextActive: {
        color: "#00aeed",
        fontWeight: "600",
    },
    submitButton: {
        backgroundColor: "#00aeed",
        borderRadius: 16,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        lineHeight: 26,
    },
});
