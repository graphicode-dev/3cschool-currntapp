import { Palette, Radii } from "@/constants/theme";
import { MappedChatMessage } from "@/hooks/useGroupChats";
import { authStore } from "@/services/auth/auth.store";
import { formatMessageTime } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import {
    Image,
    Linking,
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
    const { user } = authStore();
    const isMe = message.sender === "me";
    const isInstructor = message.sender === "user";
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [filePreviewVisible, setFilePreviewVisible] = useState(false);

    // Handle single image or array of images
    const images = message.imageUrl ? [message.imageUrl] : [];

    // Handle file attachments
    const files =
        message.fileUrl && message.fileName
            ? [
                  {
                      url: message.fileUrl,
                      name: message.fileName,
                  },
              ]
            : [];

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

    const openFilePreview = () => {
        if (files.length > 0) {
            setFilePreviewVisible(true);
        }
    };

    const closeFilePreview = () => {
        setFilePreviewVisible(false);
    };

    const handleOpenFile = async () => {
        if (files.length > 0) {
            try {
                const supported = await Linking.canOpenURL(files[0].url);
                if (supported) {
                    await Linking.openURL(files[0].url);
                } else {
                    console.log(`Cannot open URL: ${files[0].url}`);
                    // Fallback: try to open in browser
                    await Linking.openURL(files[0].url);
                }
            } catch (error) {
                console.error("Error opening file:", error);
            }
        }
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "pdf":
                return "document-text-outline";
            case "doc":
            case "docx":
                return "document-text-outline";
            case "xls":
            case "xlsx":
                return "grid-outline";
            case "ppt":
            case "pptx":
                return "easel-outline";
            case "zip":
            case "rar":
                return "archive-outline";
            case "mp3":
            case "wav":
                return "musical-notes-outline";
            case "mp4":
            case "avi":
            case "mov":
                return "videocam-outline";
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return "image-outline";
            default:
                return "document-outline";
        }
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
                            // If only images or files, no text — reduce padding
                            (images.length > 0 || files.length > 0) &&
                                !message.text &&
                                styles.bubbleImageOnly,
                        ]}
                    >
                        {/* Sender name for group chats */}
                        {shouldShowSenderName && (
                            <ThemedText style={styles.senderName} fontSize={11}>
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
                                                        fontSize={18}
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

                        {/* Files */}
                        {files.length > 0 && (
                            <TouchableOpacity
                                onPress={openFilePreview}
                                activeOpacity={0.85}
                                style={styles.fileAttachment}
                            >
                                <View style={styles.fileIcon}>
                                    <Ionicons
                                        name={getFileIcon(files[0].name)}
                                        size={20}
                                        color={Palette.brand[500]}
                                    />
                                </View>
                                <View style={styles.fileInfo}>
                                    <ThemedText
                                        style={styles.fileName}
                                        fontSize={12}
                                        numberOfLines={1}
                                    >
                                        {files[0].name}
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.fileSize}
                                        fontSize={10}
                                    >
                                        Tap to preview
                                    </ThemedText>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={Palette.slate400}
                                />
                            </TouchableOpacity>
                        )}

                        {/* ThemedText */}
                        {!!message.text && (
                            <ThemedText
                                style={[
                                    styles.text,
                                    isMe ? styles.textAdmin : styles.textUser,
                                    images.length > 0 && styles.textWithImage,
                                ]}
                                fontSize={14}
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
                            fontSize={10}
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
                                <ThemedText
                                    style={styles.closeButtonText}
                                    fontSize={18}
                                >
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
                                                fontSize={12}
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
                                                        fontSize={24}
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
                                                        fontSize={24}
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

            {/* File Preview Modal */}
            <Modal
                visible={filePreviewVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeFilePreview}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackground}
                        activeOpacity={1}
                        onPress={closeFilePreview}
                    >
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeFilePreview}
                                activeOpacity={0.8}
                            >
                                <ThemedText
                                    style={styles.closeButtonText}
                                    fontSize={18}
                                >
                                    ✕
                                </ThemedText>
                            </TouchableOpacity>

                            {files.length > 0 && (
                                <View style={styles.filePreviewContainer}>
                                    <View style={styles.filePreviewIcon}>
                                        <Ionicons
                                            name={getFileIcon(files[0].name)}
                                            size={64}
                                            color={Palette.brand[500]}
                                        />
                                    </View>
                                    <ThemedText
                                        style={styles.filePreviewName}
                                        fontSize={16}
                                        numberOfLines={2}
                                    >
                                        {files[0].name}
                                    </ThemedText>

                                    <TouchableOpacity
                                        style={styles.openFileButton}
                                        onPress={handleOpenFile}
                                        activeOpacity={0.8}
                                    >
                                        <ThemedText
                                            style={styles.openFileButtonText}
                                            fontSize={14}
                                        >
                                            Open File
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.openInBrowserButton}
                                        onPress={handleOpenFile}
                                        activeOpacity={0.8}
                                    >
                                        <ThemedText
                                            style={
                                                styles.openInBrowserButtonText
                                            }
                                            fontSize={12}
                                        >
                                            Open in Browser
                                        </ThemedText>
                                    </TouchableOpacity>
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
        fontWeight: "700",
    },
    text: { lineHeight: 20 },
    textWithImage: { marginTop: 6 },
    textAdmin: { color: Palette.white },
    textUser: { color: Palette.slate700 },
    time: { marginTop: 6 },
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
        fontWeight: "600",
    },
    // File attachment styles
    fileAttachment: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Palette.slate50,
        borderWidth: 1,
        borderColor: Palette.slate200,
        borderRadius: Radii.sm,
        padding: 8,
        marginBottom: 4,
        gap: 8,
    },
    fileIcon: {
        width: 32,
        height: 32,
        borderRadius: Radii.sm,
        backgroundColor: Palette.white,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Palette.slate200,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontWeight: "600",
        color: Palette.slate700,
        marginBottom: 1,
    },
    fileSize: {
        color: Palette.slate400,
    },
    // File preview modal styles
    filePreviewContainer: {
        backgroundColor: Palette.white,
        borderRadius: Radii.lg,
        padding: 24,
        alignItems: "center",
        width: "90%",
        maxWidth: 320,
    },
    filePreviewIcon: {
        width: 80,
        height: 80,
        borderRadius: Radii.md,
        backgroundColor: Palette.slate50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 2,
        borderColor: Palette.brand[200],
    },
    filePreviewName: {
        fontWeight: "600",
        color: Palette.slate700,
        textAlign: "center",
        marginBottom: 20,
    },
    openFileButton: {
        backgroundColor: Palette.brand[500],
        borderRadius: Radii.md,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginBottom: 12,
        width: "100%",
        alignItems: "center",
    },
    openFileButtonText: {
        color: Palette.white,
        fontWeight: "600",
    },
    openInBrowserButton: {
        backgroundColor: Palette.slate100,
        borderRadius: Radii.md,
        paddingVertical: 8,
        paddingHorizontal: 16,
        width: "100%",
        alignItems: "center",
    },
    openInBrowserButtonText: {
        color: Palette.slate600,
        fontWeight: "500",
    },
});
