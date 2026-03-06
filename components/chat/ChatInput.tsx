import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { ChatMessage } from "@/services/chats/chat.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
    onSend: (text: string, imageUri?: string) => void;
    replyTo?: ChatMessage | null;
    onClearReply?: () => void;
    isSending?: boolean;
}

const ChatInput = ({ onSend, replyTo, onClearReply, isSending }: Props) => {
    const [text, setText] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);

    const canSend = (text.trim().length > 0 || imageUri !== null) && !isSending;

    const pickImage = useCallback(async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            quality: 0.85,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setImageUri(result.assets[0].uri);
        }
    }, []);

    const handleSend = useCallback(() => {
        if (!canSend) return;
        onSend(text.trim(), imageUri ?? undefined);
        setText("");
        setImageUri(null);
        onClearReply?.();
    }, [canSend, text, imageUri, onSend, onClearReply]);

    return (
        <View style={styles.wrapper}>
            {/* Reply preview */}
            {replyTo && (
                <View style={styles.replyBar}>
                    <View style={styles.replyAccent} />
                    <View style={styles.replyContent}>
                        <Icons.XIcon size={14} color={Palette.slate400} />
                    </View>
                    <TouchableOpacity
                        style={styles.replyClose}
                        onPress={onClearReply}
                    >
                        <Icons.XIcon size={14} color={Palette.slate400} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Image preview strip */}
            {imageUri && (
                <View style={styles.previewStrip}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.previewThumb}
                        contentFit="cover"
                    />
                    <View style={styles.previewActions}>
                        <TouchableOpacity
                            style={styles.previewBtn}
                            onPress={pickImage}
                        >
                            <Ionicons
                                name="refresh-outline"
                                size={15}
                                color={Palette.brand[500]}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.previewBtn}
                            onPress={() => setImageUri(null)}
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
                        color={imageUri ? Palette.brand[500] : Palette.slate400}
                    />
                </TouchableOpacity>

                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="type a message...."
                    placeholderTextColor={Palette.slate300}
                    style={styles.input}
                    multiline={false}
                />

                <TouchableOpacity
                    style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!canSend}
                >
                    <Icons.SentIcon size={22} color="white" />
                </TouchableOpacity>
            </View>
        </View>
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
