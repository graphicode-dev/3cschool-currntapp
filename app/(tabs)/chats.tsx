import { useTranslation } from "@/contexts/LanguageContext";
import { Group, groupsService, UpcomingSession } from "@/services/groupsService";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchGroups } from "@/store/slices/groupsSlice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
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
    const { t } = useTranslation();
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
                        <Text style={styles.demoBadgeText}>{t("groups.demo")}</Text>
                    </View>
                )}

                {/* Hint Labels */}
                <View style={styles.actionButtonsRow}>
                    <View style={styles.actionButton}>
                        <Ionicons name={isTeacher ? "people-outline" : "help-circle-outline"} size={16} color="#00aeed" />
                        <Text style={styles.actionButtonText}>{isTeacher ? t("groups.chatStudents") : t("groups.askInstructor")}</Text>
                    </View>
                    <View style={styles.actionButton}>
                        <Ionicons name="calendar-outline" size={16} color="#00aeed" />
                        <Text style={styles.actionButtonText}>{t("groups.schedule")}</Text>
                    </View>
                    <View style={styles.actionButton}>
                        <Ionicons name="chatbubbles-outline" size={16} color="#00aeed" />
                        <Text style={styles.actionButtonText}>{t("groups.chatGroup")}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function formatSessionDate(dateStr: string): string {
    // Handle "2026-02-07 01:50:00" format by replacing space with T
    const normalizedDate = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;
    const date = new Date(normalizedDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function formatSessionTime(timeStr: string | null): string {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export default function GroupsScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { groups, isLoading, error } = useAppSelector(
        (state) => state.groups,
    );
    const { user } = useAppSelector((state) => state.auth);
    const { t } = useTranslation();
    const [upcomingSession, setUpcomingSession] = useState<UpcomingSession | null>(null);
    const [totalUpcoming, setTotalUpcoming] = useState<number>(0);
    const [countdown, setCountdown] = useState<string>("");

    // Animation refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    const isTeacher = useMemo(
        () => user?.role_name === "teacher",
        [user?.role_name],
    );

    // Calculate countdown
    const calculateCountdown = useCallback(() => {
        if (!upcomingSession) return "";
        
        const now = new Date();
        
        // Handle different date formats from API
        // start_date can be "2026-02-07 01:50:00" or "2026-02-07"
        let sessionDate: Date;
        
        if (upcomingSession.start_date.includes(" ")) {
            // start_date already includes time, use it directly
            sessionDate = new Date(upcomingSession.start_date.replace(" ", "T"));
        } else if (upcomingSession.start_time) {
            // start_date is just date, combine with start_time
            sessionDate = new Date(`${upcomingSession.start_date}T${upcomingSession.start_time}`);
        } else {
            // Fallback to just the date
            sessionDate = new Date(upcomingSession.start_date);
        }
        
        const diff = sessionDate.getTime() - now.getTime();
        
        if (isNaN(diff)) return "Soon";
        if (diff <= 0) return "Starting now!";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        return `${minutes}m ${seconds}s`;
    }, [upcomingSession]);

    // Start animations
    useEffect(() => {
        // Pulse animation for the badge
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        // Shimmer animation
        const shimmer = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        // Bounce animation for arrow
        const bounce = Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 5,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        pulse.start();
        shimmer.start();
        bounce.start();

        return () => {
            pulse.stop();
            shimmer.stop();
            bounce.stop();
        };
    }, [pulseAnim, shimmerAnim, bounceAnim]);

    // Countdown timer
    useEffect(() => {
        if (!upcomingSession) return;
        
        setCountdown(calculateCountdown());
        const interval = setInterval(() => {
            setCountdown(calculateCountdown());
        }, 1000);
        
        return () => clearInterval(interval);
    }, [upcomingSession, calculateCountdown]);

    useEffect(() => {
        dispatch(fetchGroups());
        fetchUpcomingSessions();
    }, [dispatch]);

    const fetchUpcomingSessions = async () => {
        try {
            const response = await groupsService.getAllSessions();
            if (response.data?.upcoming?.length > 0) {
                setUpcomingSession(response.data.upcoming[0]);
                setTotalUpcoming(response.data.total_upcoming || response.data.upcoming.length);
            } else {
                setUpcomingSession(null);
                setTotalUpcoming(0);
            }
        } catch (err) {
            console.log("Failed to fetch upcoming sessions:", err);
        }
    };

    const handleGroupPress = (groupId: number) => {
        router.push(`/group/${groupId}` as any);
    };

    const handleRefresh = () => {
        dispatch(fetchGroups());
        fetchUpcomingSessions();
    };

    if (isLoading && groups.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft} />
                    <Text style={styles.headerTitle}>{t("groups.title")}</Text>
                    <View style={styles.headerLeft} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00aeed" />
                    <Text style={styles.loadingText}>{t("groups.loadingGroups")}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && groups.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft} />
                    <Text style={styles.headerTitle}>{t("groups.title")}</Text>
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
                        <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
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
                <Text style={styles.headerTitle}>{t("groups.title")}</Text>
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

            {/* Upcoming Session Card */}
            {upcomingSession && (
                <TouchableOpacity
                    style={styles.upcomingCard}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/group/${upcomingSession.group.id}` as any)}
                >
                    <LinearGradient
                        colors={["#6366f1", "#8b5cf6", "#a855f7"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.upcomingCardGradient}
                    >
                        <View style={styles.upcomingCardHeader}>
                            <Animated.View style={[styles.upcomingBadge, { transform: [{ scale: pulseAnim }] }]}>
                                <Ionicons name="sparkles" size={12} color="#8b5cf6" />
                                <Text style={styles.upcomingBadgeText}>{t("upcomingSession.nextSession")}</Text>
                            </Animated.View>
                            <View style={styles.upcomingCountCircle}>
                                <Text style={styles.upcomingCountNumber}>{totalUpcoming}</Text>
                                <Text style={styles.upcomingCountLabel}>{t("upcomingSession.upcoming")}</Text>
                            </View>
                        </View>
                        <Text style={styles.upcomingCardTitle} numberOfLines={2}>
                               {upcomingSession.group.name}
                           
                        </Text>
                        <Text style={styles.upcomingGroupName} numberOfLines={1}>
                          {upcomingSession.group.course.title}
                        </Text>
                        
                        {/* Countdown Timer */}
                        <View style={styles.countdownContainer}>
                            <Ionicons name="timer-outline" size={18} color="#fbbf24" />
                            <Text style={styles.countdownText}>{countdown}</Text>
                        </View>
                        
                        <View style={styles.upcomingCardDetails}>
                            <View style={styles.upcomingDetailItem}>
                                <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.upcomingDetailText}>
                                    {formatSessionDate(upcomingSession.start_date)}
                                </Text>
                            </View>
                            <View style={styles.upcomingDetailItem}>
                                <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.upcomingDetailText}>
                                    {formatSessionTime(upcomingSession.start_time)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.upcomingCardFooter}>
                            <View style={styles.upcomingInstructor}>
                                <Ionicons name="person-circle" size={20} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.upcomingInstructorText}>
                                    {upcomingSession.instructor.full_name}
                                </Text>
                            </View>
                            <Animated.View style={[styles.upcomingArrow, { transform: [{ translateX: bounceAnim }] }]}>
                                <Text style={styles.upcomingArrowText}>{t("common.view")}</Text>
                                <Ionicons name="arrow-forward-circle" size={22} color="#ffffff" />
                            </Animated.View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            )}

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
                        <Text style={styles.emptyText}>{t("groups.noGroups")}</Text>
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
    actionButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: "#f0f9ff",
        borderRadius: 8,
    },
    actionButtonText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#00aeed",
    },
    upcomingCard: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    upcomingCardGradient: {
        padding: 16,
    },
    upcomingCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    upcomingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    upcomingBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#6366f1",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    upcomingCountCircle: {
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    upcomingCountNumber: {
        fontSize: 18,
        fontWeight: "800",
        color: "#ffffff",
    },
    upcomingCountLabel: {
        fontSize: 9,
        fontWeight: "500",
        color: "rgba(255,255,255,0.8)",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    upcomingCardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
        lineHeight: 22,
    },
    upcomingGroupName: {
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255,255,255,0.8)",
        marginBottom: 10,
    },
    countdownContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
        alignSelf: "flex-start",
    },
    countdownText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fbbf24",
        letterSpacing: 0.5,
    },
    upcomingCardDetails: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 14,
    },
    upcomingDetailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    upcomingDetailText: {
        fontSize: 13,
        fontWeight: "600",
        color: "rgba(255,255,255,0.95)",
    },
    upcomingCardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.2)",
    },
    upcomingInstructor: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    upcomingInstructorText: {
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255,255,255,0.9)",
    },
    upcomingArrow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    upcomingArrowText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#ffffff",
    },
});
