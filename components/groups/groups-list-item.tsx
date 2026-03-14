import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { Group } from "@/services/groups/groups.types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface GroupsListItemProps {
    group: Group;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type GroupStatus = "pending" | "upcoming" | "ongoing" | "completed";

const STATUS_STYLES: Record<
    GroupStatus,
    { bg: string; text: string; border: string }
> = {
    pending: { bg: "#E9F7FC", text: "#24ADE3", border: "#24ADE3" },
    upcoming: { bg: "#E9F7FC", text: "#24ADE3", border: "#24ADE3" },
    ongoing: { bg: "#FFF3DD", text: "#F0A500", border: "#F0A500" },
    completed: { bg: "#EBEBEB", text: "#616060", border: "#A0A0A0" },
};

function deriveStatus(g: Group): GroupStatus {
    if (g.is_finished) return "completed";
    const s = (g.status ?? "").toLowerCase();
    if (s.includes("finish") || s.includes("complet")) return "completed";
    if (s.includes("active") || s.includes("ongoing")) return "ongoing";
    if (s.includes("pending")) return "pending";
    return "upcoming";
}

function formatSchedule(g: Group): { date: string; time: string } {
    if (g.schedule?.length) {
        const s = g.schedule[0];
        return { date: s.day_label ?? "", time: s.start_time ?? "" };
    }
    if (g.start_date) {
        const d = new Date(g.start_date);
        return {
            date: d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            time: "",
        };
    }
    return { date: "", time: "" };
}

// ─── Component ───────────────────────────────────────────────────────────────

const GroupsListItem = ({ group }: GroupsListItemProps) => {
    const status = deriveStatus(group);
    const badge = STATUS_STYLES[status];
    const { date, time } = formatSchedule(group);
    const coverImage = group.course?.thumbnail || group.course?.image_cover;

    const onSessionsPress = () =>
        router.push({
            pathname: "/(app)/(tabs)/groups/[id]",
            params: { id: String(group.id) },
        });

    // const onAskInstructor = () =>
    //     router.push({
    //         pathname: "/(app)/(tabs)/groups/chat/instructor",
    //         params: {
    //             groupId: String(group.id),
    //             instructorId: String(group.teacher_id),
    //             instructorName: group.teacher?.full_name ?? "",
    //             instructorAvatar: group.teacher?.avatar ?? "",
    //         },
    //     });

    // const onChatGroup = () =>
    //     router.push({
    //         pathname: "/(app)/(tabs)/groups/chat/group",
    //         params: {
    //             groupId: String(group.id),
    //             groupName: group.name,
    //         },
    //     });

    return (
        <View style={styles.container}>
            {/* Cover image with expo-image fallback */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: coverImage }}
                    style={styles.coverImage}
                    contentFit="cover"
                />

                {/* Date/time badge */}
                {(!!date || !!time) && (
                    <View style={styles.dateBadge}>
                        {!!date && (
                            <View style={styles.metaItem}>
                                <Icons.CalenderIcon color="black" size={16} />
                                <ThemedText
                                    style={styles.dateBadgeText}
                                    fontSize={10}>
                                    {date}
                                </ThemedText>
                            </View>
                        )}
                        {!!time && (
                            <View style={styles.metaItem}>
                                <Icons.ClockIcon color="black" size={16} />
                                <ThemedText
                                    style={styles.dateBadgeText}
                                    fontSize={10}>
                                    {time}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                )}

                {/* Status badge */}
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor: badge.bg,
                            borderColor: badge.border,
                        },
                    ]}>
                    <ThemedText
                        style={[styles.statusText, { color: badge.text }]}
                        fontSize={10}>
                        {status}
                    </ThemedText>
                </View>
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
                <View style={styles.textGroup}>
                    <ThemedText
                        style={styles.title}
                        numberOfLines={1}
                        fontSize={13}>
                        {group.name}
                    </ThemedText>
                    <ThemedText
                        style={styles.description}
                        numberOfLines={2}
                        fontSize={10}>
                        {group.course?.title ?? ""}
                    </ThemedText>
                </View>
                <View style={styles.instructorRow}>
                    <Icons.InstructorIcon color="black" size={16} />
                    <ThemedText style={styles.instructorText} fontSize={10}>
                        {group.teacher?.full_name ?? "Instructor"}
                    </ThemedText>
                </View>
            </View>

            {/* Bottom actions */}
            <View style={styles.bottomRow}>
                <View style={styles.actionsLeft}>
                    {/* <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={onAskInstructor}
                        activeOpacity={0.7}
                    >
                        <Icons.QuizIcon color={Palette.brand[500]} size={16} />
                        <ThemedText style={styles.actionText}>
                            Ask Instructor
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={onChatGroup}
                        activeOpacity={0.7}
                    >
                        <Icons.ChatIcon color={Palette.brand[500]} size={16} />
                        <ThemedText style={styles.actionText}>
                            Chat Group
                        </ThemedText>
                    </TouchableOpacity> */}
                </View>

                <TouchableOpacity
                    style={styles.sessionsBtn}
                    onPress={onSessionsPress}
                    activeOpacity={0.85}>
                    <ThemedText style={styles.sessionsBtnText} fontSize={10}>
                        Sessions
                    </ThemedText>
                    <Icons.ArrowIcon color={Palette.white} size={16} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default GroupsListItem;

const styles = StyleSheet.create({
    container: {
        position: "relative",
        backgroundColor: "#E9F7FC",
        borderRadius: 20,
        flex: 1,
    },
    imageContainer: {
        marginHorizontal: 14,
        marginTop: 4,
        height: 96,
        borderRadius: 16,
        overflow: "hidden",
    },
    coverImage: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
    },
    dateBadge: {
        position: "absolute",
        top: 5,
        left: 7,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#BBE6F6",
        borderRadius: 22,
        paddingHorizontal: 6,
        paddingVertical: 4,
        shadowColor: "#24ADE3",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    statusBadge: {
        position: "absolute",
        top: 8,
        right: 10,
        borderRadius: 22,
        borderWidth: 1,
        paddingHorizontal: 6,
    },
    statusText: {
        fontFamily: "Poppins-Medium",
        textTransform: "capitalize",
    },
    dateBadgeText: {
        fontFamily: "Poppins-Medium",
        color: "#393838",
        textTransform: "capitalize",
    },

    // ── Info section ─────────────────────────────────────────────────────────
    infoSection: {
        paddingHorizontal: 10,
        paddingTop: 8,
        gap: 8,
    },
    textGroup: {
        gap: 2,
    },
    title: {
        fontFamily: "Poppins-SemiBold",
        color: "#393838",
        textTransform: "capitalize",
    },
    description: {
        fontFamily: "Poppins-Regular",
        color: "#7A7A7A",
    },
    instructorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    instructorText: {
        fontFamily: "Poppins-Medium",
        color: "#393838",
        textTransform: "capitalize",
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 4,
        marginTop: 2,
    },
    actionsLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    sessionsBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#24ADE3",
        borderTopLeftRadius: 100,
        borderBottomRightRadius: 50,
        paddingHorizontal: 20,
        height: 33,
        borderWidth: 1,
        borderColor: "#393838",
    },
    sessionsBtnText: {
        fontFamily: "Poppins-Medium",
        color: "#E9F7FC",
        textTransform: "capitalize",
    },
    arrowIcon: {
        width: 14,
        height: 8,
    },

    // ── Shared ───────────────────────────────────────────────────────────────
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaIcon: {
        width: 24,
        height: 24,
    },
});
