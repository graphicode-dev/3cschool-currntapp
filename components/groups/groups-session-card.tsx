import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { useLanguage } from "@/contexts/language-context";
import { Session } from "@/services/sessions/sessions.types";
import { ImageBackground, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

interface Props {
    session: Session;
}

const STATUS_COLORS: Record<
    string,
    { bg: string; text: string; border: string }
> = {
    upcoming: { bg: "#E9F7FC", text: "#24ADE3", border: "#E9F7FC" },
    ongoing: { bg: "#FFF3DD", text: "#F0A500", border: "#FFF3DD" },
    completed: { bg: "#EBEBEB", text: "#616060", border: "#EBEBEB" },
};

function deriveStatus(session: Session): "upcoming" | "ongoing" | "completed" {
    const raw = (session.session_status ?? "").toLowerCase();
    if (raw.includes("complet") || raw.includes("past") || raw.includes("done"))
        return "completed";
    if (
        raw.includes("ongoing") ||
        raw.includes("active") ||
        raw.includes("live")
    )
        return "ongoing";

    // Fallback: compare to current time
    try {
        const now = new Date();

        // Parse date and time more safely
        const startDate = new Date(session.start_date);
        const [hours, minutes] = session.start_time.split(":").map(Number);
        startDate.setHours(hours, minutes, 0, 0);

        const diffMs = now.getTime() - startDate.getTime();

        // If session is within the last 3 hours, consider it ongoing
        if (diffMs > 0 && diffMs < 3 * 60 * 60 * 1000) return "ongoing";

        // If session start time is in the future, it's upcoming
        if (startDate > now) return "upcoming";

        // If session was more than 3 hours ago, it's completed
        return "completed";
    } catch (error) {
        console.error("Date parsing error:", error);
        // Default to upcoming if we can't parse dates (safer than completed)
        return "upcoming";
    }
}

function fmtDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
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

export function SessionCard({ session }: Props) {
    const { t } = useLanguage();
    const status = deriveStatus(session);
    const badge = STATUS_COLORS[status];
    const title =
        session.group?.course?.title ?? t("groups.sessionCard.sessionNumber");
    const desc = t("groups.sessionCard.sessionNumber");

    return (
        <View style={styles.card}>
            <ImageBackground
                source={Images.groupCardBg}
                style={styles.bg}
                resizeMode="cover"
            >
                <View style={styles.info}>
                    <View style={styles.textGroup}>
                        <ThemedText
                            style={styles.title}
                            fontSize={16}
                            numberOfLines={2}
                            fontWeight="bold"
                        >
                            {title}
                        </ThemedText>
                        <ThemedText style={styles.desc} fontSize={13}>
                            {desc} #{session.session_number}
                        </ThemedText>
                    </View>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Icons.CalenderIcon color="white" size={16} />
                            <ThemedText
                                style={styles.metaText}
                                fontSize={13}
                                fontWeight="medium"
                            >
                                {fmtDate(session.start_date)}
                            </ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <Icons.ClockIcon color="white" size={16} />
                            <ThemedText
                                style={styles.metaText}
                                fontSize={13}
                                fontWeight="medium"
                            >
                                {fmtTime(session.start_time)}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: badge.bg,
                            borderColor: badge.border,
                        },
                    ]}
                >
                    <ThemedText
                        style={[styles.badgeText, { color: badge.text }]}
                        fontSize={10}
                        fontWeight="medium"
                    >
                        {status}
                    </ThemedText>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        overflow: "hidden",
        borderRadius: 30,
    },
    bg: {
        paddingHorizontal: 20,
        paddingTop: 17,
        paddingBottom: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    info: { flex: 1, gap: 6 },
    textGroup: { gap: 2 },
    title: {
        color: "#E9F7FC",
        textTransform: "capitalize",
    },
    desc: {
        color: "#EBEBEB",
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: {
        color: "#E9F7FC",
    },
    badge: {
        borderRadius: 31,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: "flex-start",
    },
    badgeText: {
        textTransform: "capitalize",
    },
});
