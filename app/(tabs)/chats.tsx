import { Group } from "@/services/groupsService";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchGroups } from "@/store/slices/groupsSlice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://3cschool.net";

function getTeacherInitials(name: string): string {
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(avatarSettings: string | null): string {
    if (!avatarSettings) return "#00aeed";
    try {
        const settings = JSON.parse(avatarSettings);
        return `#${settings.background || "00aeed"}`;
    } catch {
        return "#00aeed";
    }
}

function formatSchedule(
    schedule: { time: string; day_label: string }[],
): string {
    if (!schedule || schedule.length === 0) return "No schedule";
    const first = schedule[0];
    const day =
        first.day_label.charAt(0).toUpperCase() + first.day_label.slice(1);
    return `${day} • ${first.time}`;
}

function GroupCard({
    group,
    onPress,
    isTeacher,
}: {
    group: Group;
    onPress: () => void;
    isTeacher: boolean;
}) {
    const hasAvatar = group.teacher?.avatar;
    const avatarColor = getAvatarColor(group.teacher?.avatar_settings);
    const initials = getTeacherInitials(group.teacher?.full_name || "NA");
    const courseThumbnail = group.course?.thumbnail
        ? `${BASE_URL}${group.course.thumbnail}`
        : null;
    // For teachers, we don't show unread from teacher object (that's themselves)
    // For students, show unread from teacher
    const unreadCount = isTeacher ? 0 : group.teacher?.unread_count || 0;
    const lastMessage = isTeacher
        ? null
        : group.teacher?.last_message?.message || null;

    return (
        <TouchableOpacity
            style={styles.groupCard}
            activeOpacity={0.7}
            onPress={onPress}
        >
            {/* Course Thumbnail */}
            {courseThumbnail ? (
                <Image
                    source={{ uri: courseThumbnail }}
                    style={styles.courseThumbnail}
                    contentFit="cover"
                />
            ) : (
                <View style={styles.courseThumbnailPlaceholder}>
                    <Ionicons name="book-outline" size={32} color="#9ca3af" />
                </View>
            )}

            <View style={styles.groupCardContent}>
                {/* Group Name & Unread Badge */}
                <View style={styles.groupNameRow}>
                    <Text style={styles.groupName} numberOfLines={1}>
                        {group.name}
                    </Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>

                {/* Last Message or Course Title */}
                <Text
                    style={[
                        styles.courseTitle,
                        lastMessage && styles.lastMessageText,
                    ]}
                    numberOfLines={1}
                >
                    {lastMessage || group.course?.title || "No course assigned"}
                </Text>

                {/* Schedule */}
                <View style={styles.scheduleRow}>
                    <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#6b7280"
                    />
                    <Text style={styles.scheduleText}>
                        {formatSchedule(group.schedule)}
                    </Text>
                </View>

                {/* Teacher Info (for students) or Group Type (for teachers) & Status */}
                <View style={styles.bottomRow}>
                    <View style={styles.teacherInfo}>
                        {isTeacher ? (
                            <>
                                <View style={styles.groupTypeIcon}>
                                    <Ionicons
                                        name="people-outline"
                                        size={16}
                                        color="#00aeed"
                                    />
                                </View>
                                <Text
                                    style={styles.teacherName}
                                    numberOfLines={1}
                                >
                                    {group.group_type === "group"
                                        ? "Group Class"
                                        : "Private Class"}
                                </Text>
                            </>
                        ) : (
                            <>
                                {hasAvatar ? (
                                    <Image
                                        source={{
                                            uri: `${BASE_URL}${group.teacher.avatar}`,
                                        }}
                                        style={styles.teacherAvatar}
                                        contentFit="cover"
                                    />
                                ) : (
                                    <View
                                        style={[
                                            styles.teacherAvatarInitials,
                                            { backgroundColor: avatarColor },
                                        ]}
                                    >
                                        <Text
                                            style={styles.teacherInitialsText}
                                        >
                                            {initials}
                                        </Text>
                                    </View>
                                )}
                                <Text
                                    style={styles.teacherName}
                                    numberOfLines={1}
                                >
                                    {group.teacher?.full_name || "No teacher"}
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Status Badge */}
                    <View
                        style={[
                            styles.statusBadge,
                            group.status === "active"
                                ? styles.statusActive
                                : group.status === "pending"
                                  ? styles.statusPending
                                  : styles.statusDefault,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                group.status === "active"
                                    ? styles.statusTextActive
                                    : group.status === "pending"
                                      ? styles.statusTextPending
                                      : styles.statusTextDefault,
                            ]}
                        >
                            {group.status}
                        </Text>
                    </View>
                </View>

                {/* Demo Badge */}
                {group.is_demo && (
                    <View style={styles.demoBadge}>
                        <Text style={styles.demoBadgeText}>DEMO</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function GroupsScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { groups, isLoading, error } = useAppSelector(
        (state) => state.groups,
    );
    const { user } = useAppSelector((state) => state.auth);

    const isTeacher = useMemo(
        () => user?.role_name === "teacher",
        [user?.role_name],
    );

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    const handleGroupPress = (groupId: number) => {
        router.push(`/group/${groupId}` as any);
    };

    const handleRefresh = () => {
        dispatch(fetchGroups());
    };

    if (isLoading && groups.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft} />
                    <Text style={styles.headerTitle}>Groups</Text>
                    <View style={styles.headerLeft} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00aeed" />
                    <Text style={styles.loadingText}>Loading groups...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && groups.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft} />
                    <Text style={styles.headerTitle}>Groups</Text>
                    <View style={styles.headerLeft} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={48}
                        color="#dc2626"
                    />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRefresh}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft} />
                <Text style={styles.headerTitle}>Groups</Text>
                <TouchableOpacity
                    onPress={handleRefresh}
                    style={styles.refreshButton}
                >
                    <Ionicons
                        name="refresh-outline"
                        size={22}
                        color="#00aeed"
                    />
                </TouchableOpacity>
            </View>

            {/* Groups List */}
            <FlatList
                data={groups}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <GroupCard
                        group={item}
                        onPress={() => handleGroupPress(item.id)}
                        isTeacher={isTeacher}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="people-outline"
                            size={48}
                            color="#9ca3af"
                        />
                        <Text style={styles.emptyText}>No groups found</Text>
                    </View>
                }
            />
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
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#ffffff",
    },
    headerLeft: {
        width: 30,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        flex: 1,
        textAlign: "center",
    },
    refreshButton: {
        padding: 4,
        width: 30,
        alignItems: "center",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        gap: 16,
    },
    groupCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden",
    },
    courseThumbnail: {
        width: "100%",
        height: 120,
    },
    courseThumbnailPlaceholder: {
        width: "100%",
        height: 120,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },
    groupCardContent: {
        padding: 14,
        gap: 8,
    },
    groupName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        lineHeight: 22,
    },
    courseTitle: {
        fontSize: 13,
        fontWeight: "500",
        color: "#6b7280",
        lineHeight: 18,
    },
    scheduleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    scheduleText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#6b7280",
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    teacherInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    teacherAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    teacherAvatarInitials: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    teacherInitialsText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#ffffff",
    },
    teacherName: {
        fontSize: 13,
        fontWeight: "500",
        color: "#374151",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: "#dcfce7",
    },
    statusPending: {
        backgroundColor: "#fef3c7",
    },
    statusDefault: {
        backgroundColor: "#f3f4f6",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    statusTextActive: {
        color: "#16a34a",
    },
    statusTextPending: {
        color: "#d97706",
    },
    statusTextDefault: {
        color: "#6b7280",
    },
    demoBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#00aeed",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    demoBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#ffffff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#6b7280",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 14,
        color: "#dc2626",
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: "#00aeed",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 14,
        color: "#6b7280",
    },
    groupNameRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    unreadBadge: {
        backgroundColor: "#00aeed",
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    unreadText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ffffff",
    },
    lastMessageText: {
        color: "#374151",
        fontWeight: "500",
    },
    groupTypeIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#e6f7fd",
        justifyContent: "center",
        alignItems: "center",
    },
});
