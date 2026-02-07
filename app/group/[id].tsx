import { Student, Teacher } from "@/services/groupsService";
import { messagesService } from "@/services/messagesService";
import { useAppDispatch, useAppSelector } from "@/store";
import {
    clearGroupDetails,
    clearGroupSessions,
    fetchGroupDetails,
    fetchGroupSessions,
} from "@/store/slices/groupsSlice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;

const BASE_URL = "https://3cschool.net";

// Skeleton Loader Component
function SkeletonLoader({
    width,
    height,
    borderRadius = 4,
    style,
}: {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
}) {
    return (
        <View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: "#e5e7eb",
                },
                style,
            ]}
        />
    );
}

// Member Card Skeleton
function MemberCardSkeleton() {
    return (
        <View style={styles.memberCard}>
            <View style={styles.memberCardContent}>
                <SkeletonLoader width={48} height={48} borderRadius={24} />
                <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                        <SkeletonLoader
                            width={120}
                            height={16}
                            borderRadius={4}
                        />
                        <SkeletonLoader
                            width={50}
                            height={18}
                            borderRadius={6}
                        />
                    </View>
                    <SkeletonLoader
                        width={180}
                        height={14}
                        borderRadius={4}
                        style={{ marginTop: 6 }}
                    />
                </View>
                <SkeletonLoader width={20} height={20} borderRadius={4} />
            </View>
        </View>
    );
}

// Loading Skeleton for the whole screen
function LoadingSkeleton() {
    return (
        <View style={styles.listContent}>
            <View style={styles.section}>
                <SkeletonLoader
                    width={120}
                    height={18}
                    borderRadius={4}
                    style={{ marginBottom: 12 }}
                />
                <View style={styles.membersList}>
                    <MemberCardSkeleton />
                    <MemberCardSkeleton />
                    <MemberCardSkeleton />
                </View>
            </View>
        </View>
    );
}

interface MemberDisplay {
    id: number;
    name: string;
    role: "teacher" | "student";
    avatar: string | null;
    avatarColor: string;
    initials: string;
    email?: string;
    mobile?: string;
    status?: string;
    unread_count?: number;
    last_message?: string | null;
}

function formatSessionDate(value: string | null) {
    if (!value) return "TBD";
    const normalized = value.replace(" ", "T");
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
}

function formatSessionTime(value: string | null) {
    if (!value) return "";
    return value.slice(0, 5);
}

function getInitials(name: string): string {
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

function mapTeacherToMember(teacher: Teacher): MemberDisplay {
    return {
        id: teacher.id,
        name: teacher.full_name,
        role: "teacher",
        avatar: teacher.avatar ? `${BASE_URL}${teacher.avatar}` : null,
        avatarColor: getAvatarColor(teacher.avatar_settings),
        initials: getInitials(teacher.full_name),
        email: teacher.email,
        mobile: teacher.mobile,
        status: teacher.status,
        unread_count: teacher.unread_count,
        last_message: teacher.last_message?.message || null,
    };
}

function mapStudentToMember(student: Student): MemberDisplay {
    return {
        id: student.id,
        name: student.full_name,
        role: "student",
        avatar: student.avatar ? `${BASE_URL}${student.avatar}` : null,
        avatarColor: getAvatarColor(student.avatar_settings || null),
        initials: getInitials(student.full_name),
        email: student.email,
        mobile: student.mobile,
        status: student.status,
        unread_count: student.unread_count,
        last_message: student.last_message?.message || null,
    };
}

function MemberCard({
    member,
    onPress,
}: {
    member: MemberDisplay;
    onPress: () => void;
}) {
    const isOnline = member.status === "active";

    return (
        <TouchableOpacity
            style={styles.memberCard}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={styles.memberCardContent}>
                <View style={styles.avatarContainer}>
                    {member.avatar ? (
                        <Image
                            source={{ uri: member.avatar }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View
                            style={[
                                styles.avatarInitials,
                                { backgroundColor: member.avatarColor },
                            ]}
                        >
                            <Text style={styles.initialsText}>
                                {member.initials}
                            </Text>
                        </View>
                    )}
                    {isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                        <Text style={styles.memberName} numberOfLines={1}>
                            {member.name}
                        </Text>
                        <View
                            style={[
                                styles.roleBadge,
                                member.role === "teacher"
                                    ? styles.teacherBadge
                                    : styles.studentBadge,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    member.role === "teacher"
                                        ? styles.teacherText
                                        : styles.studentText,
                                ]}
                            >
                                {member.role === "teacher"
                                    ? "Teacher"
                                    : "Student"}
                            </Text>
                        </View>
                    </View>
                    <Text
                        style={[
                            styles.lastMessage,
                            member.last_message && styles.hasMessage,
                        ]}
                        numberOfLines={1}
                    >
                        {member.last_message ||
                            member.email ||
                            "No messages yet"}
                    </Text>
                </View>

                <View style={styles.memberRight}>
                    {member.unread_count !== undefined &&
                        member.unread_count > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>
                                    {member.unread_count}
                                </Text>
                            </View>
                        )}
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function GroupMembersScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const dispatch = useAppDispatch();
    const { groupDetails, groupSessions, isLoadingDetails, isLoadingSessions, error } = useAppSelector(
        (state) => state.groups,
    );
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<"sessions" | "chat">("sessions");
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchGroupDetails(Number(id)));
            dispatch(fetchGroupSessions(Number(id)));
        }
        return () => {
            dispatch(clearGroupDetails());
            dispatch(clearGroupSessions());
        };
    }, [id, dispatch]);

    // Determine what to show based on API response
    const isUserStudent = user?.role_name === "user";
    const isUserTeacher = user?.role_name === "teacher";

    // Map API data to display format
    const teachers: MemberDisplay[] = groupDetails?.teacher
        ? [mapTeacherToMember(groupDetails.teacher)]
        : [];

    const students: MemberDisplay[] = groupDetails?.students
        ? groupDetails.students.map(mapStudentToMember)
        : [];

    const sessions = groupSessions?.sessions ?? [];
    const groupName = groupSessions?.group?.name ?? "";

    const handleMemberPress = (member: MemberDisplay) => {
        router.push({
            pathname: `/chat/${id}/${member.id}`,
            params: {
                userName: member.name,
                userAvatar: member.avatar || "",
                userMobile: member.mobile || "",
            },
        } as any);
    };

    const handleSendToAll = async () => {
        if (!broadcastMessage.trim() || !id || isSendingBroadcast) return;

        setIsSendingBroadcast(true);
        try {
            const response = await messagesService.broadcastMessage(
                Number(id),
                broadcastMessage.trim(),
            );

            if (response.code === 200) {
                Alert.alert(
                    "Message Sent",
                    `Your message has been sent to ${response.data?.sent_count || students.length} students.`,
                    [{ text: "OK" }],
                );
                setBroadcastMessage("");
                setShowBroadcastModal(false);
            } else {
                Alert.alert(
                    "Error",
                    response.message || "Failed to send message",
                );
            }
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "Failed to send message. Please try again.",
            );
        } finally {
            setIsSendingBroadcast(false);
        }
    };

    if (isLoadingDetails) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color="#111827"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Group Members</Text>
                    <View style={styles.headerRight} />
                </View>
                <LoadingSkeleton />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color="#111827"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Group Members</Text>
                    <View style={styles.headerRight} />
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
                        onPress={() => dispatch(fetchGroupDetails(Number(id)))}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Group Members</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={[]}
                renderItem={null}
                ListHeaderComponent={
                    <>
                        <View style={styles.tabsContainer}>
                            <View style={styles.tabsPill}>
                                <TouchableOpacity
                                    style={[
                                        styles.tabButton,
                                        activeTab === "sessions" && styles.tabButtonActive,
                                    ]}
                                    onPress={() => setActiveTab("sessions")}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name="calendar-outline"
                                        size={16}
                                        color={
                                            activeTab === "sessions"
                                                ? "#ffffff"
                                                : "#6b7280"
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === "sessions" &&
                                                styles.tabTextActive,
                                        ]}
                                    >
                                        Sessions
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.tabButton,
                                        activeTab === "chat" && styles.tabButtonActive,
                                    ]}
                                    onPress={() => setActiveTab("chat")}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name="chatbubbles-outline"
                                        size={16}
                                        color={
                                            activeTab === "chat"
                                                ? "#ffffff"
                                                : "#6b7280"
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === "chat" &&
                                                styles.tabTextActive,
                                        ]}
                                    >
                                        Chat
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {activeTab === "sessions" ? (
                            isLoadingSessions ? (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Sessions</Text>
                                    <View style={styles.sessionsLoadingRow}>
                                        <ActivityIndicator
                                            size="small"
                                            color="#00aeed"
                                        />
                                        <Text style={styles.sessionsLoadingText}>
                                            Loading sessions...
                                        </Text>
                                    </View>
                                </View>
                            ) : sessions.length ? (
                                <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Sessions</Text>
                                    <View style={styles.sessionsCountPill}>
                                        <Text style={styles.sessionsCountText}>
                                            {sessions.length}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.groupNameCard}>
                                    <Ionicons name="people" size={18} color="#00aeed" />
                                    <Text style={styles.groupNameText} numberOfLines={1}>
                                        {groupName}
                                    </Text>
                                </View>

                                <View style={styles.sessionsList}>
                                    {sessions.map((s) => {
                                        const dateText = formatSessionDate(s.start_date);
                                        const startText = formatSessionTime(s.start_time);
                                        const endText = formatSessionTime(s.end_time);
                                        const hasMeeting = !!s.bbb_meeting_id;
                                        const hasRecording = !!s.recording_url;

                                        return (
                                            <View key={s.id} style={styles.sessionCard}>
                                                <View style={styles.sessionLeft}>
                                                    <View style={styles.sessionNumberPill}>
                                                        <Text style={styles.sessionNumberText}>
                                                            #{s.session_number}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.sessionTitle}>
                                                        Session {s.session_number}
                                                    </Text>
                                                    <Text style={styles.sessionMeta}>
                                                        {dateText}
                                                        {startText ? ` • ${startText}` : ""}
                                                        {endText ? ` - ${endText}` : ""}
                                                    </Text>
                                                    <View style={styles.instructorRow}>
                                                        <Ionicons
                                                            name="person-circle-outline"
                                                            size={18}
                                                            color="#6b7280"
                                                        />
                                                        <Text
                                                            style={styles.instructorName}
                                                            numberOfLines={1}
                                                        >
                                                            {s.instructor?.full_name || "Instructor"}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View style={styles.sessionRight}>
                                                    <View
                                                        style={[
                                                            styles.sessionBadge,
                                                            hasMeeting
                                                                ? styles.badgeLive
                                                                : styles.badgeSoon,
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name={
                                                                hasMeeting
                                                                    ? "videocam"
                                                                    : "time-outline"
                                                            }
                                                            size={12}
                                                            color={
                                                                hasMeeting
                                                                    ? "#16a34a"
                                                                    : "#0284c7"
                                                            }
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.sessionBadgeText,
                                                                hasMeeting
                                                                    ? styles.badgeTextLive
                                                                    : styles.badgeTextSoon,
                                                            ]}
                                                        >
                                                            {hasMeeting ? "Meeting" : "Scheduled"}
                                                        </Text>
                                                    </View>

                                                    <View
                                                        style={[
                                                            styles.sessionBadge,
                                                            hasRecording
                                                                ? styles.badgeRecord
                                                                : styles.badgeMuted,
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name={
                                                                hasRecording
                                                                    ? "play"
                                                                    : "play-outline"
                                                            }
                                                            size={12}
                                                            color={
                                                                hasRecording
                                                                    ? "#7c3aed"
                                                                    : "#9ca3af"
                                                            }
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.sessionBadgeText,
                                                                hasRecording
                                                                    ? styles.badgeTextRecord
                                                                    : styles.badgeTextMuted,
                                                            ]}
                                                        >
                                                            {hasRecording
                                                                ? "Recording"
                                                                : "No Recording"}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                                </View>
                            ) : (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Sessions</Text>
                                    <View style={styles.emptySessions}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={32}
                                            color="#9ca3af"
                                        />
                                        <Text style={styles.emptySessionsText}>
                                            No sessions found
                                        </Text>
                                    </View>
                                </View>
                            )
                        ) : null}

                        {activeTab === "chat" && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Chat</Text>
                                    <TouchableOpacity
                                        style={styles.openGroupChatButton}
                                        onPress={() => router.push(`/chat/${id}` as any)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="chatbox" size={14} color="#ffffff" />
                                        <Text style={styles.openGroupChatText}>
                                            Open Group Chat
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Teachers Section - shown to students */}
                        {activeTab === "chat" && isUserStudent && teachers.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Ask Teachers ({teachers.length})
                                </Text>
                                <View style={styles.membersList}>
                                    {teachers.map((member) => (
                                        <MemberCard
                                            key={member.id}
                                            member={member}
                                            onPress={() =>
                                                handleMemberPress(member)
                                            }
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Students Section - shown to teachers */}
                        {activeTab === "chat" && isUserTeacher && students.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>
                                        Students ({students.length})
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.sendToAllButton}
                                        onPress={() =>
                                            setShowBroadcastModal(true)
                                        }
                                    >
                                        <Ionicons
                                            name="send"
                                            size={14}
                                            color="#ffffff"
                                        />
                                        <Text style={styles.sendToAllText}>
                                            Send to All
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.membersList}>
                                    {students.map((member) => (
                                        <MemberCard
                                            key={member.id}
                                            member={member}
                                            onPress={() =>
                                                handleMemberPress(member)
                                            }
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Empty state */}
                        {activeTab === "chat" &&
                            !isLoadingDetails &&
                            teachers.length === 0 &&
                            students.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Ionicons
                                        name="people-outline"
                                        size={48}
                                        color="#9ca3af"
                                    />
                                    <Text style={styles.emptyText}>
                                        No members found
                                    </Text>
                                </View>
                            )}
                    </>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Broadcast Message Modal */}
            <Modal
                visible={showBroadcastModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBroadcastModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Send to All Students
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowBroadcastModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            This message will be sent to {students.length}{" "}
                            students in this group.
                        </Text>

                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Type your message here..."
                                placeholderTextColor="rgba(46, 46, 46, 0.5)"
                                value={broadcastMessage}
                                onChangeText={setBroadcastMessage}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowBroadcastModal(false)}
                                disabled={isSendingBroadcast}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!broadcastMessage.trim() ||
                                        isSendingBroadcast) &&
                                        styles.sendButtonDisabled,
                                ]}
                                onPress={handleSendToAll}
                                disabled={
                                    !broadcastMessage.trim() ||
                                    isSendingBroadcast
                                }
                            >
                                {isSendingBroadcast ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#ffffff"
                                    />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="send"
                                            size={16}
                                            color="#ffffff"
                                        />
                                        <Text style={styles.sendButtonText}>
                                            Send Message
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    backButton: {
        padding: 4,
        width: 32,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
    headerRight: {
        width: 32,
    },
    listContent: {
        paddingHorizontal: isSmallScreen ? 12 : 16,
        paddingTop: isSmallScreen ? 12 : 16,
        paddingBottom: 24,
        flexGrow: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    tabsContainer: {
        marginBottom: 16,
    },
    tabsPill: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 14,
        padding: 4,
        gap: 6,
    },
    tabButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "transparent",
    },
    tabButtonActive: {
        backgroundColor: "#00aeed",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#6b7280",
    },
    tabTextActive: {
        color: "#ffffff",
    },
    openGroupChatButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#00aeed",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    openGroupChatText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#ffffff",
    },
    sessionsLoadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
    },
    sessionsLoadingText: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    sessionsCountPill: {
        minWidth: 28,
        paddingHorizontal: 10,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#e0f2fe",
        justifyContent: "center",
        alignItems: "center",
    },
    sessionsCountText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0284c7",
    },
    groupNameCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 12,
    },
    groupNameText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    sessionsList: {
        gap: 12,
    },
    sessionCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    sessionLeft: {
        flex: 1,
    },
    sessionRight: {
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 8,
    },
    sessionNumberPill: {
        alignSelf: "flex-start",
        backgroundColor: "#f0f9ff",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
    },
    sessionNumberText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0284c7",
    },
    sessionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    sessionMeta: {
        fontSize: 13,
        color: "#6b7280",
        fontWeight: "500",
        marginBottom: 8,
    },
    instructorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    instructorName: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
    },
    sessionBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    sessionBadgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    badgeLive: {
        backgroundColor: "#dcfce7",
    },
    badgeSoon: {
        backgroundColor: "#e0f2fe",
    },
    badgeRecord: {
        backgroundColor: "#f3e8ff",
    },
    badgeMuted: {
        backgroundColor: "#f3f4f6",
    },
    badgeTextLive: {
        color: "#16a34a",
    },
    badgeTextSoon: {
        color: "#0284c7",
    },
    badgeTextRecord: {
        color: "#7c3aed",
    },
    badgeTextMuted: {
        color: "#9ca3af",
    },
    emptySessions: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        gap: 8,
    },
    emptySessionsText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6b7280",
    },
    sendToAllButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#00aeed",
        paddingHorizontal: isSmallScreen ? 10 : 12,
        paddingVertical: isSmallScreen ? 6 : 8,
        borderRadius: 8,
        gap: isSmallScreen ? 4 : 6,
    },
    sendToAllText: {
        fontSize: isSmallScreen ? 11 : 12,
        fontWeight: "600",
        color: "#ffffff",
    },
    membersList: {
        gap: 12,
    },
    memberCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    memberCardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: isSmallScreen ? 12 : 15,
        paddingVertical: isSmallScreen ? 12 : 16,
        gap: isSmallScreen ? 10 : 12,
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: isSmallScreen ? 42 : 48,
        height: isSmallScreen ? 42 : 48,
        borderRadius: isSmallScreen ? 21 : 24,
    },
    avatarInitials: {
        width: isSmallScreen ? 42 : 48,
        height: isSmallScreen ? 42 : 48,
        borderRadius: isSmallScreen ? 21 : 24,
        justifyContent: "center",
        alignItems: "center",
    },
    initialsText: {
        fontSize: isSmallScreen ? 12 : 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    onlineIndicator: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#22c55e",
        borderWidth: 2,
        borderColor: "#ffffff",
    },
    memberInfo: {
        flex: 1,
        gap: 4,
    },
    memberHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: isSmallScreen ? 6 : 8,
        flexWrap: "wrap",
    },
    memberName: {
        fontSize: isSmallScreen ? 14 : 15,
        fontWeight: "600",
        color: "#111827",
        lineHeight: isSmallScreen ? 18 : 21,
        flexShrink: 1,
    },
    roleBadge: {
        paddingHorizontal: isSmallScreen ? 6 : 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    teacherBadge: {
        backgroundColor: "#fef3c7",
    },
    studentBadge: {
        backgroundColor: "#e6f7fd",
    },
    roleText: {
        fontSize: 10,
        fontWeight: "600",
    },
    teacherText: {
        color: "#d97706",
    },
    studentText: {
        color: "#00aeed",
    },
    lastMessage: {
        fontSize: isSmallScreen ? 13 : 14,
        color: "#6b7280",
        lineHeight: isSmallScreen ? 18 : 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: isSmallScreen ? 16 : 24,
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: isSmallScreen ? 16 : 24,
        width: "100%",
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    modalCloseButton: {
        padding: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
        lineHeight: 20,
    },
    textAreaContainer: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 120,
        marginBottom: 20,
    },
    textArea: {
        fontSize: 16,
        color: "#2e2e2e",
        lineHeight: 24,
        flex: 1,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    sendButton: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#00aeed",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    sendButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    sendButtonText: {
        fontSize: 14,
        fontWeight: "600",
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
    memberRight: {
        flexDirection: "row",
        alignItems: "center",
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
    hasMessage: {
        color: "#374151",
        fontWeight: "500",
    },
});
