import SessionVideoPlayer from "@/components/groups/session-video-player";
import { ThemedText } from "@/components/themed-text";
import { Palette, Radii, Shadows, Spacing } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { RecordedVideo } from "@/services/groups/groups.types";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
    videos: RecordedVideo[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GroupsSessionPlaylist = ({ videos }: Props) => {
    const { t } = useLanguage();
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* ═══════════════ Video Player Card ═══════════════ */}
            <SessionVideoPlayer embedHtml={videos[selectedIndex].embedHtmlAr} />

            {/* ═══════════════ Playlist Card ═══════════════ */}
            <View style={styles.playlistCard}>
                {/* Header */}
                <View style={styles.playlistHeader}>
                    <ThemedText
                        style={styles.headerText}
                        fontWeight="bold"
                        fontSize={14}
                    >
                        {t("groups.playlist.videos")}
                    </ThemedText>
                </View>

                {/* List */}
                <View style={styles.playlistList}>
                    {videos.map((item, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.7}
                                style={[
                                    styles.playlistItem,
                                    isSelected && styles.playlistItemSelected,
                                ]}
                                onPress={() => setSelectedIndex(index)}
                            >
                                {isSelected && (
                                    <View style={styles.selectedIndicator} />
                                )}
                                <ThemedText
                                    style={[
                                        styles.itemNumber,
                                        isSelected && styles.itemTextSelected,
                                    ]}
                                    fontSize={13}
                                    fontWeight="medium"
                                >
                                    {index + 1}-
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.itemTitle,
                                        isSelected && styles.itemTextSelected,
                                    ]}
                                    fontSize={13}
                                    fontWeight="medium"
                                >
                                    {item.title}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
};

export default GroupsSessionPlaylist;

// ─── Styles ───────────────────────────────────────────────────────────────────

const PRIMARY = Palette.brand[500];
const PRIMARY_LIGHT = Palette.brand[100];
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
        gap: Spacing.lg,
    },

    // ── Playlist Card ─────────────────────────────────────────────────────────
    playlistCard: {
        backgroundColor: Palette.white,
        borderRadius: Radii.lg,
        overflow: "hidden",
        ...Shadows.card,
    },
    playlistHeader: {
        backgroundColor: PRIMARY,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderTopLeftRadius: Radii.lg,
        borderTopRightRadius: Radii.lg,
    },
    headerText: {
        color: Palette.white,
    },
    playlistList: {
        paddingVertical: Spacing.sm,
    },
    playlistItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: 4,
        position: "relative",
    },
    playlistItemSelected: {
        backgroundColor: PRIMARY_LIGHT,
    },
    selectedIndicator: {
        position: "absolute",
        left: 0,
        top: 8,
        bottom: 8,
        width: 4,
        borderRadius: 2,
        backgroundColor: PRIMARY,
    },
    itemNumber: {
        color: Palette.slate900,
    },
    itemTitle: {
        color: Palette.slate900,
        flexShrink: 1,
    },
    itemTextSelected: {
        color: PRIMARY,
    },
});
