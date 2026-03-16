import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { SessionWithInfo } from "@/services/sessions/sessions.types";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
    session: SessionWithInfo;
};

function fmtDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function fmtTime(timeStr: string) {
    try {
        const [h, m] = timeStr.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
    } catch {
        return timeStr;
    }
}

function getStatusBadgeStyle(
    status: "upcoming" | "completed" | "current" | null,
) {
    switch (status) {
        case "upcoming":
            return {
                backgroundColor: "#fef3c7",
                borderColor: "#f59e0b",
                textColor: "#f59e0b",
                label: "Upcoming",
            };
        case "current":
            return {
                backgroundColor: "#f0f9ff",
                borderColor: "#3b82f6",
                textColor: "#3b82f6",
                label: "Current",
            };
        case "completed":
            return {
                backgroundColor: "#f0fdf4",
                borderColor: "#22c55e",
                textColor: "#22c55e",
                label: "Completed",
            };
        default:
            return {
                backgroundColor: "#f3f4f6",
                borderColor: "#9ca3af",
                textColor: "#9ca3af",
                label: "Pending",
            };
    }
}

const SessionsListItem = ({ session }: Props) => {
    const { t } = useLanguage();
    const title =
        session.session_info?.title ?? `Session #${session.session_number}`;
    const hasRecording = !!session.recording_url;
    const statusStyle = getStatusBadgeStyle(session.session_status);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Title + session number badge */}
                <View style={styles.header}>
                    <ThemedText
                        style={styles.typeText}
                        fontWeight="medium"
                        fontSize={14}
                    >
                        #{session.session_number}
                    </ThemedText>
                    <ThemedText
                        style={styles.title}
                        fontSize={14}
                        fontWeight="bold"
                        numberOfLines={2}
                    >
                        {title}
                    </ThemedText>
                    <View
                        style={[
                            styles.typeBadge,
                            {
                                backgroundColor: statusStyle.backgroundColor,
                                borderColor: statusStyle.borderColor,
                            },
                        ]}
                    >
                        <ThemedText
                            style={[
                                styles.typeText,
                                { color: statusStyle.textColor },
                            ]}
                            fontWeight="medium"
                            fontSize={10}
                        >
                            {statusStyle.label}
                        </ThemedText>
                    </View>
                </View>

                {/* Date + Time */}
                <View style={styles.dateTimeContainer}>
                    <View style={styles.infoItem}>
                        <Icons.CalenderIcon
                            size={16}
                            color={Palette.brand[500]}
                        />
                        <ThemedText
                            style={styles.infoText}
                            fontSize={13}
                            fontWeight="medium"
                        >
                            {fmtDate(session.start_date)}
                        </ThemedText>
                    </View>
                    <View style={styles.infoItem}>
                        <Icons.ClockIcon size={16} color={Palette.brand[500]} />
                        <ThemedText
                            style={styles.infoText}
                            fontSize={13}
                            fontWeight="medium"
                        >
                            {fmtTime(session.start_time)}
                        </ThemedText>
                    </View>
                </View>

                {/* Instructor + recording */}
                <View style={styles.footer}>
                    <View style={styles.instructorInfo}>
                        <Icons.InstructorIcon size={16} color="black" />
                        <ThemedText
                            style={styles.instructorName}
                            fontSize={13}
                            fontWeight="medium"
                            numberOfLines={1}
                        >
                            {session.instructor?.full_name ?? "Instructor"}
                        </ThemedText>
                    </View>

                    {hasRecording && (
                        <TouchableOpacity
                            style={styles.recordingButton}
                            onPress={() =>
                                Linking.openURL(session.recording_url!).catch(
                                    () => {},
                                )
                            }
                        >
                            <ThemedText
                                style={styles.recordingText}
                                fontWeight="medium"
                                fontSize={10}
                            >
                                {t("sessions.recording")}
                            </ThemedText>
                            <Icons.ArrowIcon size={16} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export default SessionsListItem;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderWidth: 0.8,
        borderColor: Palette.slate900,
        borderRadius: 22,
        overflow: "hidden",
        width: "100%",
        padding: 20,
    },
    content: {
        flex: 1,
        gap: 11,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        gap: 8,
    },
    title: {
        flex: 1,
        fontWeight: "600",
        color: Palette.slate900,
        textTransform: "capitalize",
    },
    typeBadge: {
        backgroundColor: "#f6f8ff",
        borderWidth: 1,
        borderColor: "#98a5e8",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    typeText: {
        fontWeight: "500",
        color: "#98a5e8",
    },
    dateTimeContainer: { flexDirection: "row", gap: 12, alignItems: "center" },
    infoItem: { flexDirection: "row", gap: 4, alignItems: "center" },
    infoText: {
        fontWeight: "500",
        color: Palette.brand[500],
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    instructorInfo: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        flex: 1,
    },
    instructorName: {
        fontWeight: "500",
        color: Palette.slate900,
        textTransform: "capitalize",
        flex: 1,
    },
    recordingButton: {
        backgroundColor: Palette.brand[500],
        borderWidth: 1,
        borderColor: Palette.slate900,
        borderRadius: 35,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 11,
        paddingVertical: 2,
        gap: 4,
    },
    recordingText: {
        color: "#e9f7fc",
        textTransform: "capitalize",
    },
});
