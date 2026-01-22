import { useAppDispatch, useAppSelector } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BASE_URL = "https://3cschool.net";

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

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await dispatch(logoutUser()).unwrap();
              router.replace("/login");
            } catch (error) {
              console.error("Logout error:", error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const avatarColor = getAvatarColor(user?.avatar_settings || null);
  const initials = getInitials(user?.full_name || "User");
  const hasAvatar = user?.avatar;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient Background */}
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              {hasAvatar ? (
                <Image
                  source={{ uri: `${BASE_URL}${user?.avatar}` }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatarInitials,
                    { backgroundColor: avatarColor },
                  ]}
                >
                  <Text style={styles.initialsText}>{initials}</Text>
                </View>
              )}
            </View>
            {user?.status === "active" && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
        </View>

        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <Text style={styles.userName}>{user?.full_name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "No email"}</Text>

          <View style={styles.badgesRow}>
            {user?.role_name && (
              <View style={styles.roleBadge}>
                <Ionicons
                  name={user.role_name === "user" ? "school" : "briefcase"}
                  size={12}
                  color="#00aeed"
                />
                <Text style={styles.roleText}>
                  {user.role_name === "user" ? "Student" : user.role_name}
                </Text>
              </View>
            )}
            {user?.student_code && (
              <View style={styles.codeBadge}>
                <Ionicons name="id-card" size={12} color="#8b5cf6" />
                <Text style={styles.codeText}>#{user.student_code}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="time-outline"
            value={user?.session_quota || 0}
            label="Sessions"
            color="#00aeed"
          />
          <StatCard
            icon="school-outline"
            value={user?.age || "-"}
            label="Age"
            color="#10b981"
          />
          <StatCard
            icon="trophy-outline"
            value={user?.logged_count || 0}
            label="Logins"
            color="#f59e0b"
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: "#e6f7fd" },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color="#00aeed" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || "Not set"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: "#dcfce7" },
                ]}
              >
                <Ionicons name="call-outline" size={18} color="#10b981" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>
                  {user?.mobile || "Not set"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: "#fef3c7" },
                ]}
              >
                <Ionicons name="location-outline" size={18} color="#f59e0b" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {user?.city && user?.country
                    ? `${user.city}, ${user.country}`
                    : user?.country || "Not set"}
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: "#ede9fe" },
                ]}
              >
                <Ionicons name="school-outline" size={18} color="#8b5cf6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>School</Text>
                <Text style={styles.infoValue}>
                  {user?.school || "Not set"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.infoSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>3C School App v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    backgroundColor: "#00aeed",
    paddingTop: 20,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  avatarWrapper: {
    alignItems: "center",
    position: "relative",
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 36,
    fontWeight: "600",
    color: "#ffffff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22c55e",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  userInfoCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00aeed",
    textTransform: "capitalize",
  },
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
