import CustomHeader from "@/components/custom-header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette, Spacing } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { MappedTicket, useTicketChat } from "@/hooks/useTicketChat";
import { router } from "expo-router";
import {
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

// ─── Helpers ─────────────────────────────────────────────────────────────────-

const priorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
        case "high":
            return { bg: "#e9f7fc", text: "#24ade3" };
        case "medium":
            return { bg: "#e4e8ff", text: "#98a5e8" };
        case "low":
            return { bg: "#fff3dd", text: "#ff6748" };
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
    const { t } = useLanguage();
    const pc = priorityColor(ticket.priority);
    const sc = statusColor(ticket.status);

    return (
        <TouchableOpacity
            style={[
                styles.ticketCard,
                {
                    backgroundColor: pc.bg,
                },
            ]}
            onPress={() =>
                router.push({
                    pathname: "/(app)/(tabs)/support/[id]",
                    params: { id: String(ticket.id) },
                })
            }
        >
            <View style={styles.ticketHeader}>
                <ThemedText
                    style={styles.ticketTitle}
                    fontWeight="bold"
                    fontSize={14}
                >
                    {ticket.title}
                </ThemedText>
                <View style={styles.headerRight}>
                    {ticket.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <ThemedText
                                style={styles.unreadText}
                                fontWeight="bold"
                                fontSize={10}
                            >
                                {ticket.unreadCount}
                            </ThemedText>
                        </View>
                    )}
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: sc.bg,
                                borderColor: sc.text,
                            },
                        ]}
                    >
                        <ThemedText
                            style={[styles.statusText, { color: sc.text }]}
                            fontWeight="medium"
                            fontSize={10}
                        >
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
                    fontSize={12}
                >
                    {ticket.lastMessage.attachment
                        ? "📎 " +
                          (ticket.lastMessage.message ||
                              t("support.index.attachment"))
                        : ticket.lastMessage.message ||
                          t("support.index.noMessage")}
                </ThemedText>
            )}
            <View style={styles.ticketFooter}>
                <View style={styles.ticketLeftInfo}>
                    <View style={styles.dateContainer}>
                        <Icons.ClockIcon size={18} color={Palette.brand[500]} />
                        <ThemedText
                            style={styles.dateText}
                            fontWeight="medium"
                            fontSize={11}
                        >
                            {formatDate(ticket.created_at)}
                        </ThemedText>
                    </View>
                    <View
                        style={[
                            styles.priorityBadge,
                            {
                                backgroundColor: pc.bg,
                            },
                        ]}
                    >
                        <ThemedText
                            style={[
                                styles.priorityText,
                                {
                                    color: pc.text,
                                },
                            ]}
                            fontWeight="bold"
                            fontSize={10}
                        >
                            #{ticket.priority}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.viewButton}>
                    <ThemedText
                        style={styles.viewText}
                        fontWeight="bold"
                        fontSize={10}
                    >
                        {t("support.index.view")}
                    </ThemedText>
                    <Icons.ArrowIcon
                        size={16}
                        color={Palette.brand[500]}
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
    const { width } = useWindowDimensions();
    const { t } = useLanguage();
    const fabSize = Math.round((width / 375) * 60);

    const onNewTicketPress = () => {
        router.push("/(app)/(tabs)/support/create");
    };

    return (
        <>
            <ScreenWrapper>
                <CustomHeader title={t("support.index.title")} />
                <PullToRefreshScrollView
                    refetches={[refetch]}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
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
                                }}
                            >
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
                                        fontWeight="bold"
                                        fontSize={16}
                                    >
                                        {t("support.index.heroTitle")}
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.heroSubtitle}
                                        fontSize={13}
                                    >
                                        {t("support.index.heroSubtitle")}
                                    </ThemedText>
                                </View>
                            </ImageBackground>
                        </View>
                    </View>

                    {/* My Tickets Section */}
                    <View style={styles.ticketsSection}>
                        <ThemedText
                            style={styles.sectionTitle}
                            fontWeight="bold"
                            fontSize={16}
                        >
                            {t("support.index.myTickets")}
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
                                <ThemedText
                                    style={styles.emptyText}
                                    fontWeight="bold"
                                    fontSize={18}
                                >
                                    {t("support.index.noTicketsYet")}
                                </ThemedText>
                                <ThemedText
                                    style={styles.emptySubText}
                                    fontSize={13}
                                >
                                    {t("support.index.tapPlusToOpen")}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </PullToRefreshScrollView>
            </ScreenWrapper>

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={onNewTicketPress}
                style={[
                    styles.fab,
                    {
                        width: fabSize,
                        height: fabSize,
                        bottom: Math.round((width / 375) * 140),
                    },
                ]}
            >
                <Icons.TicketChatIcon
                    size={Math.round(fabSize * 0.5)}
                    color="white"
                />
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
        color: "#ebebeb",
        textTransform: "capitalize",
    },
    heroSubtitle: {
        color: "#bbe6f6",
        textTransform: "capitalize",
    },
    ticketsSection: {
        gap: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        color: "#393838",
        textTransform: "capitalize",
    },
    ticketsList: {
        gap: 12,
    },
    ticketCard: {
        borderRadius: 22,
        borderWidth: 0.8,
        borderColor: "black",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Palette.white,
        // minHeight: 116,
    },
    ticketHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ticketTitle: {
        color: "#393838",
        textTransform: "capitalize",
        fontWeight: "bold",
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
        color: "#6cc8ec",
        textTransform: "capitalize",
    },
    ticketDescription: {
        color: "#7a7a7a",
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
        color: Palette.brand[500],
        textTransform: "capitalize",
    },
    priorityText: {
        textTransform: "capitalize",
    },
    priorityBadge: {
        borderRadius: 31,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    viewText: {
        color: "#393838",
        textTransform: "capitalize",
        fontWeight: "bold",
    },
    fab: {
        position: "absolute",
        bottom: 120,
        right: 20,
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
        color: Palette.slate400,
    },
    emptySubText: {
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
        color: "white",
        textAlign: "center",
    },
});
