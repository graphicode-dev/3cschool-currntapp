import { Palette } from "@/constants/theme";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../themed-text";

interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    rightIcon?: React.ReactNode;
    keyboardType?: "default" | "email-address" | "phone-pad";
    /** Validation error message from react-hook-form / zod */
    error?: string;
}

function InputField({
    label,
    value,
    onChangeText,
    rightIcon,
    keyboardType,
    error,
}: InputFieldProps) {
    return (
        <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabel}>{label}</ThemedText>
            <View
                style={[
                    styles.inputContainer,
                    !!error && styles.inputContainerError,
                ]}
            >
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={Palette.slate200}
                    keyboardType={keyboardType}
                />
                {rightIcon && (
                    <View style={styles.inputRightIcon}>{rightIcon}</View>
                )}
            </View>
            {!!error && (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}
        </View>
    );
}

export default InputField;

const styles = StyleSheet.create({
    inputWrapper: {
        gap: 4,
    },
    inputLabel: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 14,
        color: Palette.slate500,
        textTransform: "capitalize",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Palette.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Palette.slate50,
        paddingHorizontal: 20,
        paddingVertical: 18,
        overflow: "hidden",
    },
    inputContainerError: {
        borderColor: "#e53e3e",
    },
    textInput: {
        flex: 1,
        fontFamily: "Poppins-Regular",
        fontSize: 15,
        color: Palette.slate900,
        padding: 0,
        margin: 0,
    },
    inputRightIcon: {
        position: "absolute",
        right: 16,
        alignSelf: "center",
    },
    errorText: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#e53e3e",
        marginTop: 2,
    },
});
