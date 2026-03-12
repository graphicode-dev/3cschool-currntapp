import { Palette, Radii } from "@/constants/theme";
import { MappedChatMessage } from "@/hooks/useGroupChats";
import { useProfile } from "@/services/auth";
import { formatMessageTime } from "@/utils";
import { memo, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Avatar from "../avatar";
import { ThemedText } from "../themed-text";

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    message: MappedChatMessage;
    chatType?: "private" | "group";
    showAvatar?: boolean;
    showSenderName?: boolean;
}

const ChatBubble = ({
    message,
    chatType = "private",
    showAvatar = true,
    showSenderName = false,
}: Props) => {
    const { data: user } = useProfile();
    const isMe = message.sender === "me";
    const isInstructor = message.sender === "user";
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Handle single image or array of images
    const images = message.imageUrl ? [message.imageUrl] : [];

    const timestamp = formatMessageTime(message.createdAt, isMe);
    const shouldShowSenderName =
        chatType === "group" && !isMe && showSenderName;

    const openImagePreview = (index: number = 0) => {
        setCurrentImageIndex(index);
        setImagePreviewVisible(true);
    };

    const closeImagePreview = () => {
        setImagePreviewVisible(false);
        setCurrentImageIndex(0);
    };

    return (
        <>
            <Pressable
                delayLongPress={500}
                style={[styles.row, isMe && styles.rowReverse]}
            >
                {!isMe && showAvatar && (
                    <Avatar
                        name={message.senderName || (isInstructor ? "I" : "U")}
                        size={32}
                        image={message.avatar}
                    />
                )}
                {isMe && showAvatar && (
                    <Avatar
                        name={user?.full_name?.charAt(0).toUpperCase() || "B"}
                        size={32}
                        image={user?.avatar || undefined}
                    />
                )}

                <View style={styles.bubbleWrapper}>
                    <View
                        style={[
                            styles.bubble,
                            isMe ? styles.bubbleAdmin : styles.bubbleUser,
                            // If only images, no text — reduce padding
                            images.length > 0 &&
                                !message.text &&
                                styles.bubbleImageOnly,
                        ]}
                    >
                        {/* Sender name for group chats */}
                        {shouldShowSenderName && (
                            <ThemedText style={styles.senderName}>
                                {message.senderName || "Unknown"}
                            </ThemedText>
                        )}

                        {/* Images — single or grid */}
                        {images.length === 1 && (
                            <TouchableOpacity
                                onPress={() => openImagePreview(0)}
                                activeOpacity={0.85}
                            >
                                <Image
                                    source={{ uri: images[0] }}
                                    style={styles.singleImage}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}

                        {images.length > 1 && (
                            <View style={styles.imageGrid}>
                                {images.slice(0, 4).map((uri, i) => {
                                    const isLast = i === 3 && images.length > 4;
                                    return (
                                        <TouchableOpacity
                                            key={uri + i}
                                            onPress={() => openImagePreview(i)}
                                            activeOpacity={0.85}
                                            style={styles.gridItem}
                                        >
                                            <Image
                                                source={{ uri }}
                                                style={styles.gridImage}
                                                resizeMode="cover"
                                            />
                                            {isLast && (
                                                <View
                                                    style={styles.moreOverlay}
                                                >
                                                    <ThemedText
                                                        style={styles.moreText}
                                                    >
                                                        +{images.length - 3}
                                                    </ThemedText>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        {/* ThemedText */}
                        {!!message.text && (
                            <ThemedText
                                style={[
                                    styles.text,
                                    isMe ? styles.textAdmin : styles.textUser,
                                    images.length > 0 && styles.textWithImage,
                                ]}
                            >
                                {message.text}
                            </ThemedText>
                        )}

                        {/* Timestamp */}
                        <ThemedText
                            style={[
                                styles.time,
                                isMe ? styles.timeAdmin : styles.timeUser,
                            ]}
                        >
                            {timestamp}
                        </ThemedText>
                    </View>
                </View>
            </Pressable>

            {/* Image Preview Modal */}
            <Modal
                visible={imagePreviewVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImagePreview}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackground}
                        activeOpacity={1}
                        onPress={closeImagePreview}
                    >
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeImagePreview}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.closeButtonText}>
                                    ✕
                                </ThemedText>
                            </TouchableOpacity>

                            {images.length > 0 && (
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{
                                            uri: images[currentImageIndex],
                                        }}
                                        style={styles.previewImage}
                                        resizeMode="contain"
                                    />

                                    {/* Image counter for multiple images */}
                                    {images.length > 1 && (
                                        <View style={styles.imageCounter}>
                                            <ThemedText
                                                style={styles.imageCounterText}
                                            >
                                                {currentImageIndex + 1} /{" "}
                                                {images.length}
                                            </ThemedText>
                                        </View>
                                    )}

                                    {/* Navigation buttons for multiple images */}
                                    {images.length > 1 && (
                                        <>
                                            {currentImageIndex > 0 && (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.navButton,
                                                        styles.prevButton,
                                                    ]}
                                                    onPress={() =>
                                                        setCurrentImageIndex(
                                                            currentImageIndex -
                                                                1,
                                                        )
                                                    }
                                                    activeOpacity={0.8}
                                                >
                                                    <ThemedText
                                                        style={
                                                            styles.navButtonText
                                                        }
                                                    >
                                                        ‹
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            )}

                                            {currentImageIndex <
                                                images.length - 1 && (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.navButton,
                                                        styles.nextButton,
                                                    ]}
                                                    onPress={() =>
                                                        setCurrentImageIndex(
                                                            currentImageIndex +
                                                                1,
                                                        )
                                                    }
                                                    activeOpacity={0.8}
                                                >
                                                    <ThemedText
                                                        style={
                                                            styles.navButtonText
                                                        }
                                                    >
                                                        ›
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
};

export default memo(ChatBubble);

const GRID_SIZE = 110;

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        maxWidth: "80%",
        marginBottom: 4,
    },
    rowReverse: { flexDirection: "row-reverse", alignSelf: "flex-end" },
    bubbleWrapper: { flex: 1 },
    bubble: {
        padding: 14,
        borderRadius: Radii.xl,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
    },
    bubbleImageOnly: { padding: 6 },
    bubbleAdmin: {
        backgroundColor: Palette.brand[500],
        borderBottomRightRadius: 4,
        borderColor: Palette.brand[500],
    },
    bubbleUser: {
        backgroundColor: Palette.white,
        borderBottomLeftRadius: 4,
        borderColor: `${Palette.brand[500]}20`,
    },
    senderName: {
        fontSize: 11,
        fontWeight: "600",
        color: Palette.slate600,
        marginBottom: 4,
        marginLeft: 4,
    },
    // Single image
    singleImage: {
        width: "100%",
        height: 180,
        borderRadius: Radii.md,
        marginBottom: 4,
    },
    // Grid images
    imageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 3,
        marginBottom: 4,
        borderRadius: Radii.md,
        overflow: "hidden",
    },
    gridItem: {
        width: GRID_SIZE,
        height: GRID_SIZE,
        position: "relative",
    },
    gridImage: {
        width: "100%",
        height: "100%",
        borderRadius: Radii.sm,
    },
    moreOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: Radii.sm,
        alignItems: "center",
        justifyContent: "center",
    },
    moreText: {
        color: Palette.white,
        fontSize: 18,
        fontWeight: "700",
    },
    text: { fontSize: 14, lineHeight: 20 },
    textWithImage: { marginTop: 6 },
    textAdmin: { color: Palette.white },
    textUser: { color: Palette.slate700 },
    time: { fontSize: 10, marginTop: 6 },
    timeAdmin: { color: "rgba(255,255,255,0.6)", textAlign: "right" },
    timeUser: { color: Palette.slate400 },
    // Modal styles for image preview
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBackground: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        position: "relative",
        width: "90%",
        maxHeight: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: -50,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: Radii.full,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    closeButtonText: {
        color: Palette.white,
        fontSize: 18,
        fontWeight: "600",
    },
    imageContainer: {
        width: "100%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: Radii.md,
    },
    imageCounter: {
        position: "absolute",
        bottom: 20,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radii.full,
    },
    imageCounterText: {
        color: Palette.white,
        fontSize: 12,
        fontWeight: "600",
    },
    navButton: {
        position: "absolute",
        width: 50,
        height: 50,
        borderRadius: Radii.full,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    prevButton: {
        left: 20,
    },
    nextButton: {
        right: 20,
    },
    navButtonText: {
        color: Palette.white,
        fontSize: 24,
        fontWeight: "600",
    },
});
