import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
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

const SessionsListItem = ({ session }: Props) => {
    const title =
        session.session_info?.title ?? `Session #${session.session_number}`;
    const hasRecording = !!session.recording_url;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Title + session number badge */}
                <View style={styles.header}>
                    <ThemedText style={styles.title} numberOfLines={2}>
                        {title}
                    </ThemedText>
                    <View style={styles.typeBadge}>
                        <ThemedText style={styles.typeText}>
                            #{session.session_number}
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
                        <ThemedText style={styles.infoText}>
                            {fmtDate(session.start_date)}
                        </ThemedText>
                    </View>
                    <View style={styles.infoItem}>
                        <Icons.ClockIcon size={16} color={Palette.brand[500]} />
                        <ThemedText style={styles.infoText}>
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
                            <ThemedText style={styles.recordingText}>
                                Recording
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
        fontSize: 14,
        fontWeight: "600",
        color: Palette.slate900,
        fontFamily: "Poppins-SemiBold",
        textTransform: "capitalize",
    },
    typeBadge: {
        backgroundColor: "#f6f8ff",
        borderWidth: 1,
        borderColor: "#98a5e8",
        borderRadius: 31,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    typeText: {
        fontSize: 10,
        fontWeight: "500",
        color: "#98a5e8",
        fontFamily: "Poppins-Medium",
    },
    dateTimeContainer: { flexDirection: "row", gap: 12, alignItems: "center" },
    infoItem: { flexDirection: "row", gap: 4, alignItems: "center" },
    infoText: {
        fontSize: 13,
        fontWeight: "500",
        color: Palette.brand[500],
        fontFamily: "Poppins-Medium",
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
        fontSize: 13,
        fontWeight: "500",
        color: Palette.slate900,
        fontFamily: "Poppins-Medium",
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
        fontSize: 10,
        color: "#e9f7fc",
        fontFamily: "Poppins-Medium",
        textTransform: "capitalize",
    },
});
