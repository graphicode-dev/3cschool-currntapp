import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "class";
  isRead: boolean;
}

const NOTIFICATIONS_DATA: Notification[] = [
  {
    id: "1",
    title: "Class Reminder",
    message: "Your Python class starts in 30 minutes",
    time: "10 min ago",
    type: "class",
    isRead: false,
  },
  {
    id: "2",
    title: "Assignment Submitted",
    message: "Your assignment has been successfully submitted",
    time: "1 hour ago",
    type: "success",
    isRead: false,
  },
  {
    id: "3",
    title: "New Message",
    message: "You have a new message from your teacher",
    time: "2 hours ago",
    type: "info",
    isRead: true,
  },
  {
    id: "4",
    title: "Session Quota Low",
    message: "You have 5 sessions remaining in your quota",
    time: "Yesterday",
    type: "warning",
    isRead: true,
  },
  {
    id: "5",
    title: "Class Completed",
    message: "Great job! You completed the JavaScript basics class",
    time: "2 days ago",
    type: "success",
    isRead: true,
  },
];

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "class":
      return { name: "calendar", color: "#00aeed", bg: "#e6f7fd" };
    case "success":
      return { name: "checkmark-circle", color: "#10b981", bg: "#dcfce7" };
    case "warning":
      return { name: "alert-circle", color: "#f59e0b", bg: "#fef3c7" };
    case "info":
    default:
      return { name: "information-circle", color: "#6366f1", bg: "#e0e7ff" };
  }
}

function NotificationCard({ item }: { item: Notification }) {
  const icon = getNotificationIcon(item.type);

  return (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
        <Ionicons
          name={icon.name as keyof typeof Ionicons.glyphMap}
          size={22}
          color={icon.color}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const unreadCount = NOTIFICATIONS_DATA.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={NOTIFICATIONS_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#9ca3af"
            />
            <Text style={styles.emptyText}>No notifications yet</Text>
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
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  unreadCard: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  unreadTitle: {
    fontWeight: "600",
    color: "#111827",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00aeed",
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
