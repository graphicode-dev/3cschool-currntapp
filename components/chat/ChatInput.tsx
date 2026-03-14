import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

interface Props {
    onSend: (text: string, attachmentUri?: string, fileName?: string) => void;
    isSending?: boolean;
}

interface Attachment {
    uri: string;
    name: string;
    type: "image" | "document";
}

const ChatInput = ({ onSend, isSending }: Props) => {
    const [text, setText] = useState("");
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const { width } = useWindowDimensions();
    const scaleFont = (size: number) => Math.round((width / 375) * size);

    const canSend =
        (text.trim().length > 0 || attachment !== null) && !isSending;

    const pickImage = useCallback(async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            quality: 0.85,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setAttachment({
                uri: result.assets[0].uri,
                name: result.assets[0].fileName || "image.jpg",
                type: "image",
            });
        }
    }, []);

    const pickDocument = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setAttachment({
                    uri: asset.uri,
                    name: asset.name,
                    type: "document",
                });
            }
        } catch (error) {
            console.error("Error picking document:", error);
        }
    }, []);

    const handleSend = useCallback(() => {
        if (!canSend) return;
        onSend(text.trim(), attachment?.uri, attachment?.name);
        setText("");
        setAttachment(null);
    }, [canSend, text, attachment, onSend]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View style={styles.wrapper}>
                {/* Attachment preview strip */}
                {attachment && (
                    <View style={styles.previewStrip}>
                        {attachment.type === "image" ? (
                            <Image
                                source={{ uri: attachment.uri }}
                                style={styles.previewThumb}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={styles.documentPreview}>
                                <Ionicons
                                    name="document-text-outline"
                                    size={24}
                                    color={Palette.brand[500]}
                                />
                                <ThemedText
                                    style={styles.documentName}
                                    numberOfLines={1}
                                >
                                    {attachment.name}
                                </ThemedText>
                            </View>
                        )}
                        <View style={styles.previewActions}>
                            <TouchableOpacity
                                style={styles.previewBtn}
                                onPress={
                                    attachment.type === "image"
                                        ? pickImage
                                        : pickDocument
                                }
                            >
                                <Ionicons
                                    name="refresh-outline"
                                    size={15}
                                    color={Palette.brand[500]}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.previewBtn}
                                onPress={() => setAttachment(null)}
                            >
                                <Icons.XIcon size={13} color="#e53e3e" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Input row */}
                <View style={styles.inputRow}>
                    {/* Image picker icon */}
                    <TouchableOpacity
                        style={styles.imageBtn}
                        onPress={pickImage}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="image-outline"
                            size={22}
                            color={
                                attachment?.type === "image"
                                    ? Palette.brand[500]
                                    : Palette.slate400
                            }
                        />
                    </TouchableOpacity>

                    {/* Document picker icon */}
                    <TouchableOpacity
                        style={styles.documentBtn}
                        onPress={pickDocument}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="document-text-outline"
                            size={22}
                            color={
                                attachment?.type === "document"
                                    ? Palette.brand[500]
                                    : Palette.slate400
                            }
                        />
                    </TouchableOpacity>

                    <TextInput
                        value={text}
                        onChangeText={setText}
                        placeholder="type a message...."
                        placeholderTextColor={Palette.slate300}
                        style={[styles.input, { fontSize: scaleFont(12) }]}
                        multiline={false}
                    />

                    <TouchableOpacity
                        style={[
                            styles.sendBtn,
                            !canSend && styles.sendBtnDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={!canSend}
                    >
                        <Icons.SentIcon size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatInput;

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: "center",
        width: 342,
        marginVertical: 10,
    },

    // ── Reply bar ────────────────────────────────────────────────────────────
    replyBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Palette.slate100,
        borderRadius: 10,
        marginBottom: 6,
        overflow: "hidden",
    },
    replyAccent: {
        width: 3,
        alignSelf: "stretch",
        backgroundColor: Palette.brand[500],
    },
    replyContent: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    replyClose: {
        padding: 10,
    },

    // ── Image preview strip ──────────────────────────────────────────────────
    previewStrip: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 8,
    },
    previewThumb: {
        width: 64,
        height: 64,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Palette.brand[200],
    },
    documentPreview: {
        width: 64,
        height: 64,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Palette.brand[200],
        backgroundColor: Palette.slate50,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    documentName: {
        fontSize: 8,
        color: Palette.slate600,
        textAlign: "center",
        marginTop: 2,
    },
    previewActions: {
        flexDirection: "column",
        gap: 6,
    },
    previewBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: Palette.slate200,
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Input row ────────────────────────────────────────────────────────────
    inputRow: {
        height: 56,
        backgroundColor: "white",
        borderRadius: 17,
        borderWidth: 1,
        borderColor: Palette.brand[200],
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 8,
        paddingRight: 58,
    },
    imageBtn: {
        paddingHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    documentBtn: {
        paddingHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        flex: 1,
        fontSize: 12,
        fontFamily: "Poppins-Medium",
        color: Palette.slate700,
        paddingVertical: 0,
        paddingHorizontal: 4,
    },
    sendBtn: {
        width: 50,
        height: 50,
        backgroundColor: Palette.brand[500],
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        right: 3,
    },
    sendBtnDisabled: {
        backgroundColor: Palette.slate200,
    },
});
