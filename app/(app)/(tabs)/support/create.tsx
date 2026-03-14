import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { toast } from "@/components/ui/Toast";
import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { useCreateTicket } from "@/services/tickets/tickets.mutations";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Priority = "high" | "medium" | "low";

interface FormData {
    title: string;
    message: string;
    priority: Priority;
}

const PRIORITIES: {
    label: string;
    value: Priority;
    color: string;
    bg: string;
}[] = [
    {
        label: "High",
        value: "high",
        color: Palette.brand[500],
        bg: Palette.brand[50],
    },
    { label: "Medium", value: "medium", color: "#a7b5ff", bg: "#f6f8ff" },
    { label: "Low", value: "low", color: "#ff6748", bg: "#fffcfc" },
];

export default function SupportCreateScreen() {
    const { mutateAsync: createTicket, isPending } = useCreateTicket();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: { title: "", message: "", priority: "high" },
    });

    const onSubmit = async (data: FormData) => {
        try {
            await createTicket(data);
            toast.success("Ticket created", "We'll get back to you soon.");
            router.back();
        } catch {
            toast.error("Error", "Failed to create ticket. Please try again.");
        }
    };

    return (
        <ScreenWrapper>
            <CustomHeader title="Send Help" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                overScrollMode="never">
                {/* Headline */}
                <View style={styles.headRow}>
                    <ThemedText style={styles.headTitle} fontSize={26}>
                        We&apos;re Here to Help!
                    </ThemedText>
                    <Icons.RobotIcon size={28} color={Palette.brand[500]} />
                </View>

                {/* Title */}
                <View style={styles.field}>
                    <ThemedText style={styles.label} fontSize={14}>
                        Title
                    </ThemedText>
                    <Controller
                        control={control}
                        name="title"
                        rules={{ required: "Title is required" }}
                        render={({ field: { onChange, value } }) => (
                            <View
                                style={[
                                    styles.inputBox,
                                    !!errors.title && styles.inputError,
                                ]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Brief description of your issue"
                                    placeholderTextColor={Palette.slate400}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            </View>
                        )}
                    />
                    {errors.title && (
                        <ThemedText style={styles.errorText} fontSize={12}>
                            {errors.title.message}
                        </ThemedText>
                    )}
                </View>

                {/* Message / Description */}
                <View style={styles.field}>
                    <ThemedText style={styles.label} fontSize={14}>
                        Message
                    </ThemedText>
                    <Controller
                        control={control}
                        name="message"
                        rules={{ required: "Please describe your issue" }}
                        render={({ field: { onChange, value } }) => (
                            <View
                                style={[
                                    styles.inputBox,
                                    styles.textAreaBox,
                                    !!errors.message && styles.inputError,
                                ]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Please describe your issue in detail"
                                    placeholderTextColor={Palette.slate400}
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                />
                            </View>
                        )}
                    />
                    {errors.message && (
                        <ThemedText style={styles.errorText} fontSize={12}>
                            {errors.message.message}
                        </ThemedText>
                    )}
                </View>

                {/* Priority */}
                <View style={styles.field}>
                    <ThemedText style={styles.label} fontSize={14}>
                        Priority
                    </ThemedText>
                    <Controller
                        control={control}
                        name="priority"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.priorityRow}>
                                {PRIORITIES.map((p) => {
                                    const selected = value === p.value;
                                    return (
                                        <TouchableOpacity
                                            key={p.value}
                                            style={[
                                                styles.priorityBtn,
                                                selected && {
                                                    backgroundColor: p.bg,
                                                    borderColor: p.color,
                                                },
                                            ]}
                                            onPress={() => onChange(p.value)}>
                                            <View
                                                style={[
                                                    styles.radio,
                                                    selected && {
                                                        borderColor: p.color,
                                                    },
                                                ]}>
                                                {selected && (
                                                    <View
                                                        style={[
                                                            styles.radioDot,
                                                            {
                                                                backgroundColor:
                                                                    p.color,
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </View>
                                            <ThemedText
                                                style={[
                                                    styles.priorityLabel,
                                                    selected && {
                                                        color: p.color,
                                                    },
                                                ]}
                                                fontSize={13}>
                                                {p.label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        isPending && styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}>
                    {isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <ThemedText style={styles.submitText} fontSize={16}>
                            Send
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 150,
        gap: 20,
    },
    headRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    headTitle: {
        fontFamily: "Poppins-SemiBold",
        color: Palette.slate900,
    },

    field: { gap: 6 },
    label: {
        fontFamily: "Poppins-SemiBold",
        color: Palette.slate900,
        textTransform: "capitalize",
    },
    inputBox: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: Palette.slate200,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    textAreaBox: { height: 130, justifyContent: "flex-start", paddingTop: 14 },
    inputError: { borderColor: "#e53e3e" },
    input: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: Palette.slate900,
        padding: 0,
    },
    textArea: { height: "100%", textAlignVertical: "top" },
    errorText: {
        color: "#e53e3e",
        fontFamily: "Poppins-Regular",
    },

    // Priority
    priorityRow: { flexDirection: "row", gap: 10 },
    priorityBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Palette.slate200,
        backgroundColor: "#fff",
    },
    radio: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Palette.slate300,
        justifyContent: "center",
        alignItems: "center",
    },
    radioDot: { width: 7, height: 7, borderRadius: 4 },
    priorityLabel: {
        fontFamily: "Poppins-Medium",
        color: Palette.slate500,
        textTransform: "capitalize",
    },

    // Submit
    submitBtn: {
        backgroundColor: Palette.slate900,
        height: 58,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: {
        fontFamily: "Poppins-SemiBold",
        color: "#fff",
        textTransform: "capitalize",
    },
});
