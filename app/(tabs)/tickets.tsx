import { Ticket, ticketsService } from "@/services/ticketsService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return priority;
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "in_progress":
      return {
        backgroundColor: "#e6f7fd",
        color: "#00aeed",
        label: "In Progress",
      };
    case "resolved":
      return {
        backgroundColor: "#d1fae5",
        color: "#2bb673",
        label: "Resolved",
      };
    case "open":
      return {
        backgroundColor: "#fef3c7",
        color: "#d97706",
        label: "Open",
      };
    case "closed":
      return {
        backgroundColor: "#e5e7eb",
        color: "#6b7280",
        label: "Closed",
      };
    default:
      return {
        backgroundColor: "#e5e7eb",
        color: "#6b7280",
        label: status,
      };
  }
}

function TicketCard({
  ticket,
  onPress,
}: {
  ticket: Ticket;
  onPress: () => void;
}) {
  const statusStyle = getStatusStyle(ticket.status);

  return (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketTitleContainer}>
          <Text style={styles.ticketTitle} numberOfLines={1}>
            {ticket.title}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </View>
        <Text style={styles.ticketNumber}>Ticket #{ticket.id}</Text>
      </View>
      <View style={styles.ticketFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {statusStyle.label}
          </Text>
        </View>
        <Text style={styles.categoryText}>
          {getPriorityLabel(ticket.priority)}
        </Text>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={12} color="#6b7280" />
          <Text style={styles.dateText}>{formatDate(ticket.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TicketsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      }
      setError(null);
      const response = await ticketsService.getTickets();
      if (response.data) {
        setTickets(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets]),
  );

  const handleTicketPress = (ticketId: number) => {
    router.push(`/ticket/${ticketId}` as any);
  };

  const handleCreateTicket = () => {
    router.push("/ticket/create" as any);
  };

  const handleRefresh = () => {
    fetchTickets(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerLeft} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00aeed" />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerLeft} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTickets()}
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#00aeed" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#00aeed"]}
            tintColor="#00aeed"
          />
        }
      >
        {/* Help Banner */}
        <View style={styles.helpBanner}>
          <View style={styles.helpBannerContent}>
            <View style={styles.helpIconContainer}>
              <Ionicons name="help-circle" size={24} color="#ffffff" />
            </View>
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>How can we help you?</Text>
              <Text style={styles.helpDescription}>
                Our support team is here to help with any questions or technical
                issues.
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Tickets Section */}
        <View style={styles.ticketsSection}>
          <Text style={styles.sectionTitle}>Your Recent Tickets</Text>
          {tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="ticket-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No tickets yet</Text>
              <Text style={styles.emptySubtext}>
                Create a ticket to get help from our support team
              </Text>
            </View>
          ) : (
            <View style={styles.ticketsList}>
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onPress={() => handleTicketPress(ticket.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateTicket}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  helpBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#e6f7fd",
  },
  helpBannerContent: {
    flexDirection: "row",
    gap: 16,
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00aeed",
    alignItems: "center",
    justifyContent: "center",
  },
  helpTextContainer: {
    flex: 1,
    gap: 8,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e2e2e",
    lineHeight: 28,
  },
  helpDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6b7280",
    lineHeight: 28,
  },
  ticketsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2e2e2e",
    lineHeight: 32,
  },
  ticketsList: {
    gap: 16,
  },
  ticketCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    gap: 8,
  },
  ticketHeader: {
    gap: 4,
  },
  ticketTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2e2e2e",
    flex: 1,
    lineHeight: 32,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6b7280",
    lineHeight: 28,
  },
  ticketFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "400",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6b7280",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6b7280",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#00aeed",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLeft: {
    width: 30,
  },
  refreshButton: {
    padding: 4,
    width: 30,
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
