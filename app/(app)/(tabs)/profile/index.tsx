import Avatar from "@/components/avatar";
import CustomHeader from "@/components/custom-header";
import ChipItem from "@/components/profile/ChipItem";
import InfoRow from "@/components/profile/InfoRow";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/themed-text";
import { PullToRefreshScrollView } from "@/components/ui/Pulltorefresh";
import { Icons } from "@/constants/icons";
import { Images } from "@/constants/images";
import { Palette, Spacing } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useLogout } from "@/services/auth";
import { useAuthStore } from "@/services/auth/auth.store";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// ─── Profile Screen ───────────────────────────────────────────────────────────
function ProfileScreen() {
    const { mutate: logout } = useLogout();
    const { user } = useAuthStore();
    const { language, toggleLanguage } = useLanguage();

    const isStudent = user?.role_name === "user";
    const isTeacher = user?.role_name === "teacher";

    return (
        <ScreenWrapper bgImage={Images.profileBg}>
            <CustomHeader title="Profile" divider />
            <PullToRefreshScrollView
                refetches={[]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar section */}
                <View style={styles.avatarSection}>
                    <Avatar
                        image={user?.avatar!}
                        name={user?.full_name!}
                        size={102}
                        badge={
                            user?.role_name === "user"
                                ? "student"
                                : user?.role_name
                        }
                    />

                    <ThemedText style={styles.profileName} fontSize={16}>
                        {user?.full_name}
                    </ThemedText>
                    <ThemedText
                        style={styles.profileEmail}
                        fontSize={14}
                        fontWeight="regular"
                    >
                        {user?.email}
                    </ThemedText>
                    {isStudent && (
                        <ThemedText
                            style={styles.studentCode}
                            fontSize={14}
                            fontWeight="bold"
                        >
                            ID: {user?.id}
                        </ThemedText>
                    )}

                    {isStudent && (
                        <View style={styles.chips}>
                            <ChipItem
                                label="Age"
                                value={user?.age?.toString() || "-"}
                            />
                            <ChipItem
                                label="Level"
                                value={user?.next_course_id?.toString() || "-"}
                            />
                            <ChipItem
                                label="Code"
                                value={user?.student_code || "-"}
                            />
                        </View>
                    )}
                </View>

                {/* Info card */}
                <View style={styles.infoCard}>
                    {/* English toggle row */}
                    <View style={styles.languageRow}>
                        <ThemedText style={styles.languageLabel} fontSize={13}>
                            Language
                        </ThemedText>
                        <TouchableOpacity
                            onPress={toggleLanguage}
                            activeOpacity={0.8}
                            style={styles.languageToggle}
                        >
                            <View
                                style={[
                                    styles.languageOption,
                                    language === "en" && styles.languageActive,
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.languageOptionText,
                                        language === "en" &&
                                            styles.languageActiveText,
                                    ]}
                                    fontSize={12}
                                >
                                    EN
                                </ThemedText>
                            </View>
                            <View
                                style={[
                                    styles.languageOption,
                                    language === "ar" && styles.languageActive,
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.languageOptionText,
                                        language === "ar" &&
                                            styles.languageActiveText,
                                    ]}
                                    fontSize={12}
                                >
                                    AR
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <InfoRow label="Phone" value={user?.mobile!} />
                    {isStudent && (
                        <>
                            <InfoRow
                                label="Parent Phone"
                                value={user?.parent_number! || "-"}
                            />
                            <View style={styles.subscriptionContainer}>
                                <ThemedText
                                    style={styles.subscriptionLabel}
                                    fontSize={13}
                                >
                                    Subscription
                                </ThemedText>
                                <View style={styles.subscriptionValueContainer}>
                                    <ThemedText
                                        style={styles.subscriptionValue}
                                        fontSize={13}
                                        fontWeight="bold"
                                    >
                                        {user?.session_quota?.toString() || "-"}
                                    </ThemedText>
                                </View>
                            </View>
                        </>
                    )}
                    {isTeacher && (
                        <InfoRow label="Current Groups: " value={"-"} />
                    )}
                    <InfoRow label="Address" value={user?.address || "-"} />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutRow}
                    onPress={() => logout()}
                >
                    <ThemedText style={styles.logoutText} fontSize={14}>
                        Log Out
                    </ThemedText>
                    <Icons.LogoutIcon size={20} color="#EF4444" />
                </TouchableOpacity>
            </PullToRefreshScrollView>
        </ScreenWrapper>
    );
}

export default ProfileScreen;
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    flex: { flex: 1 },

    scrollView: {
        flex: 1,
        paddingVertical: Spacing.md,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 150,
        gap: 30,
    },

    // Edit button (top right)
    editButton: {
        position: "absolute",
        top: 16,
        right: 0,
        width: 39,
        height: 39,
        borderRadius: 36,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },

    // Avatar
    avatarSection: {
        position: "relative",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 19,
        gap: 5,
    },

    profileName: {
        textTransform: "capitalize",
        textAlign: "center",
        fontWeight: "bold",
    },
    profileEmail: {
        textAlign: "center",
        color: Palette.slate800,
    },
    studentCode: {
        textTransform: "capitalize",
        textAlign: "center",
        color: Palette.brand[500],
    },
    chips: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Palette.slate100,
        borderWidth: 1,
        borderColor: Palette.slate200,
    },

    // Language toggle
    languageRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    languageLabel: {
        fontFamily: "Poppins_500Medium",
        textTransform: "capitalize",
    },
    languageToggle: {
        flexDirection: "row",
        backgroundColor: Palette.slate50,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Palette.slate200,
        padding: 3,
        gap: 2,
    },
    languageOption: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    languageActive: {
        backgroundColor: Palette.brand[500],
        borderRadius: 20,
        padding: 3,
    },
    languageOptionText: {
        fontFamily: "Poppins-Medium",
        color: Palette.slate500,
    },
    languageActiveText: {
        color: Palette.white,
        fontFamily: "Poppins-SemiBold",
    },

    // Info card
    infoCard: {
        backgroundColor: "white",
        borderRadius: 29,
        padding: 20,
        overflow: "hidden",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    subscriptionContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
    },
    subscriptionLabel: {
        textTransform: "capitalize",
    },
    subscriptionValueContainer: {
        backgroundColor: Palette.brand[50],
        borderWidth: 1,
        borderColor: Palette.brand[500],
        borderRadius: 50,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 60,
    },
    subscriptionValue: {
        fontFamily: "Poppins_500Medium",
        color: Palette.brand[500],
        textTransform: "capitalize",
    },

    // Logout
    logoutRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    logoutText: {
        fontFamily: "Poppins_600SemiBold",
        color: "#EF4444",
        textTransform: "capitalize",
    },
});
