import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
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
        const start = new Date(`${session.start_date}T${session.start_time}`);
        const diffMs = now.getTime() - start.getTime();
        if (diffMs > 0 && diffMs < 3 * 60 * 60 * 1000) return "ongoing";
        if (start > now) return "upcoming";
    } catch {}
    return "completed";
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
    const status = deriveStatus(session);
    const badge = STATUS_COLORS[status];
    const title =
        session.group?.course?.title ?? `Session #${session.session_number}`;
    const desc = `Session #${session.session_number}`;

    return (
        <View style={styles.card}>
            <ImageBackground
                source={Images.groupCardBg}
                style={styles.bg}
                resizeMode="cover"
            >
                <View style={styles.info}>
                    <View style={styles.textGroup}>
                        <ThemedText style={styles.title} numberOfLines={1}>
                            {title}
                        </ThemedText>
                        <ThemedText style={styles.desc}>{desc}</ThemedText>
                    </View>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Icons.CalenderIcon color="white" size={16} />
                            <ThemedText style={styles.metaText}>
                                {fmtDate(session.start_date)}
                            </ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <Icons.ClockIcon color="white" size={16} />
                            <ThemedText style={styles.metaText}>
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
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: "#E9F7FC",
        textTransform: "capitalize",
    },
    desc: {
        fontSize: 13,
        fontFamily: "Poppins-Regular",
        color: "#EBEBEB",
    },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: {
        fontSize: 13,
        fontFamily: "Poppins-Medium",
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
        fontSize: 10,
        fontFamily: "Poppins-Medium",
        textTransform: "capitalize",
    },
});
