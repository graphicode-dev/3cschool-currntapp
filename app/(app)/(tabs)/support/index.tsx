import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette, Spacing } from "@/constants/theme";
import { MappedTicket, useTicketChat } from "@/hooks/useTicketChat";
import { router } from "expo-router";
import {
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Helpers ─────────────────────────────────────────────────────────────────-

const priorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
        case "high":
            return { bg: "#e9f0fe", text: Palette.brand[500] };
        case "medium":
            return { bg: "#f3f0fe", text: "#a7b5ff" };
        case "low":
            return { bg: "#fff3f0", text: "#ff6748" };
        default:
            return { bg: Palette.slate100, text: Palette.slate500 };
    }
};

const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
        case "open":
            return { bg: "#e6f7ff", text: "#1890ff" };
        case "in_progress":
            return { bg: "#fff7e6", text: "#fa8c16" };
        case "closed":
            return { bg: "#f6ffed", text: "#52c41a" };
        default:
            return { bg: Palette.slate100, text: Palette.slate500 };
    }
};

const formatDate = (ts: number | string) => {
    try {
        let date: Date;

        if (typeof ts === "string") {
            // Handle string dates like "2025-11-02 14:24:17"
            date = new Date(ts);
        } else {
            // Handle different timestamp formats
            // Unix timestamps from API are in seconds, even if large
            // JavaScript timestamps are in milliseconds (much larger)
            if (ts < 1000000000000) {
                // Assume seconds (Unix timestamp from API)
                date = new Date(ts * 1000);
            } else {
                // Assume milliseconds (JavaScript timestamp)
                date = new Date(ts);
            }
        }

        if (isNaN(date.getTime())) {
            return "Invalid date";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "Invalid date";
    }
};

// ─── Ticket Card Component ─────────────────────────────────────────────────────

const TicketCard = ({ ticket }: { ticket: MappedTicket }) => {
    const pc = priorityColor(ticket.priority);
    const sc = statusColor(ticket.status);

    return (
        <TouchableOpacity
            style={[
                styles.ticketCard,
                {
                    backgroundColor: Palette.white,
                    borderColor: Palette.slate200,
                },
            ]}
            onPress={() =>
                router.push({
                    pathname: "/(app)/(tabs)/support/[id]",
                    params: { id: String(ticket.id) },
                })
            }>
            <View style={styles.ticketHeader}>
                <ThemedText style={styles.ticketTitle} fontSize={14}>
                    {ticket.title}
                </ThemedText>
                <View style={styles.headerRight}>
                    {ticket.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <ThemedText style={styles.unreadText} fontSize={10}>
                                {ticket.unreadCount}
                            </ThemedText>
                        </View>
                    )}
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: "#e9f7fc" },
                        ]}>
                        <ThemedText
                            style={[styles.statusText, { color: sc.text }]}
                            fontSize={10}>
                            {ticket.status.replace("_", " ")}
                        </ThemedText>
                    </View>
                </View>
            </View>
            {/* <ThemedText style={styles.ticketDescription}>
                {ticket.description}
            </ThemedText> */}
            {ticket.lastMessage && (
                <ThemedText
                    style={styles.ticketDescription}
                    numberOfLines={1}
                    fontSize={12}>
                    {ticket.lastMessage.attachment
                        ? "📎 " + (ticket.lastMessage.message || "Attachment")
                        : ticket.lastMessage.message || "No message"}
                </ThemedText>
            )}
            <View style={styles.ticketFooter}>
                <View style={styles.ticketLeftInfo}>
                    <View style={styles.dateContainer}>
                        <Icons.ClockIcon size={18} color={Palette.brand[500]} />
                        <ThemedText style={styles.dateText} fontSize={11}>
                            {formatDate(ticket.created_at)}
                        </ThemedText>
                    </View>
                    <ThemedText
                        style={[
                            styles.priorityText,
                            {
                                color: pc.text,
                            },
                        ]}
                        fontSize={10}>
                        #{ticket.priority}
                    </ThemedText>
                </View>
                <View style={styles.viewButton}>
                    <ThemedText style={styles.viewText} fontSize={10}>
                        View
                    </ThemedText>
                    <Icons.ArrowIcon
                        size={16}
                        color={Palette.slate500}
                        direction={{ right: true }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ─── Screen ─────────────────────────────────────────────────────────────────--

export default function SupportScreen() {
    const { tickets, refetch, isLoading } = useTicketChat();

    const onNewTicketPress = () => {
        router.push("/(app)/(tabs)/support/create");
    };

    return (
        <>
            <ScreenWrapper>
                <CustomHeader title="Help & Support" />
                <PullToRefreshScrollView
                    refetches={[refetch]}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}>
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.heroBackground}>
                            <ImageBackground
                                source={Images.supportHeader}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 16,
                                }}>
                                {/* Content */}
                                <View style={styles.heroIconContainer}>
                                    <Icons.QuestionIcon
                                        size={26}
                                        color="white"
                                    />
                                </View>
                                <View style={styles.heroTextContainer}>
                                    <ThemedText
                                        style={styles.heroTitle}
                                        fontSize={16}>
                                        How can we help you?
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.heroSubtitle}
                                        fontSize={13}>
                                        Our support team here for you!
                                    </ThemedText>
                                </View>
                            </ImageBackground>
                        </View>
                    </View>

                    {/* My Tickets Section */}
                    <View style={styles.ticketsSection}>
                        <ThemedText style={styles.sectionTitle} fontSize={16}>
                            My Tickets
                        </ThemedText>
                        <View style={styles.ticketsList}>
                            {tickets.map((ticket) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </View>

                        {/* Empty state */}
                        {!isLoading && tickets.length === 0 && (
                            <View style={styles.empty}>
                                <Icons.QuestionIcon
                                    size={48}
                                    color={Palette.slate300}
                                />
                                <ThemedText style={styles.emptyText} fontSize={18}>
                                    No tickets yet
                                </ThemedText>
                                <ThemedText style={styles.emptySubText} fontSize={13}>
                                    Tap the + button to open a support ticket
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </PullToRefreshScrollView>
            </ScreenWrapper>

            {/* Floating Action Button */}
            <TouchableOpacity onPress={onNewTicketPress} style={styles.fab}>
                <Icons.ChatIcon size={36} color="white" />
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        paddingVertical: Spacing.md,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 100,
        gap: 30,
    },
    heroSection: {
        marginBottom: 20,
    },
    heroBackground: {
        height: 97,
        backgroundColor: Palette.brand[500],
        borderRadius: 22,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 49,
        position: "relative",
        overflow: "hidden",
    },
    decorativeElement1: {
        position: "absolute",
        width: 192,
        height: 190,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 100,
        top: -143,
        right: -50,
        transform: [{ rotate: "-59.65deg" }],
    },
    decorativeElement2: {
        position: "absolute",
        width: 192,
        height: 190,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 100,
        top: -156,
        right: -56,
        transform: [{ rotate: "-70.19deg" }],
    },
    decorativeElement3: {
        position: "absolute",
        width: 108,
        height: 80,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 20,
        top: -64,
        right: 18,
        transform: [{ rotate: "46.93deg" }],
    },
    heroIconContainer: {
        width: 26,
        height: 26,
    },
    heroTextContainer: {
        gap: 2,
        width: 218,
    },
    heroTitle: {
        fontFamily: "Poppins_600SemiBold",
        color: "#ebebeb",
        textTransform: "capitalize",
    },
    heroSubtitle: {
        fontFamily: "Poppins_400Regular",
        color: "#bbe6f6",
        textTransform: "capitalize",
    },
    ticketsSection: {
        gap: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontFamily: "Poppins_600SemiBold",
        color: "#393838",
        textTransform: "capitalize",
    },
    ticketsList: {
        gap: 12,
    },
    ticketCard: {
        borderRadius: 22,
        borderWidth: 0.8,
        borderColor: "#393838",
        padding: 16,
        backgroundColor: Palette.white,
        minHeight: 116,
    },
    ticketHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 13,
    },
    ticketTitle: {
        fontFamily: "Poppins_600SemiBold",
        color: "#393838",
        textTransform: "capitalize",
    },
    statusBadge: {
        backgroundColor: "#e9f7fc",
        borderWidth: 1,
        borderColor: "#6cc8ec",
        borderRadius: 31,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    statusText: {
        fontFamily: "Poppins_500Medium",
        color: "#6cc8ec",
        textTransform: "capitalize",
    },
    ticketDescription: {
        fontFamily: "Poppins_400Regular",
        color: "#7a7a7a",
        marginBottom: 8,
        textTransform: "capitalize",
    },
    ticketFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ticketLeftInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dateText: {
        fontFamily: "Poppins_500Medium",
        color: Palette.brand[500],
        textTransform: "capitalize",
    },
    priorityText: {
        fontFamily: "Poppins_600SemiBold",
        textTransform: "capitalize",
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    viewText: {
        fontFamily: "Poppins_600SemiBold",
        color: "#393838",
        textTransform: "capitalize",
    },
    fab: {
        position: "absolute",
        bottom: 120,
        right: 20,
        width: 70,
        height: 70,
        backgroundColor: Palette.brand[500],
        padding: 10,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        gap: 12,
    },
    emptyText: {
        fontFamily: "Poppins-SemiBold",
        color: Palette.slate400,
    },
    emptySubText: {
        fontFamily: "Poppins-Regular",
        color: Palette.slate300,
        textAlign: "center",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    unreadBadge: {
        backgroundColor: "#ff4d4f",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    unreadText: {
        fontFamily: "Poppins_600SemiBold",
        color: "white",
        textAlign: "center",
    },
});
