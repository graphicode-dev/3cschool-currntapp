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
    const { language, toggleLanguage, t } = useLanguage();

    const isStudent = user?.role_name === "user";
    const isTeacher = user?.role_name === "teacher";

    return (
        <ScreenWrapper bgImage={Images.profileBg}>
            <CustomHeader title={t("profile.index.title")} divider />
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
                    <ThemedText
                        style={styles.studentCode}
                        fontSize={14}
                        fontWeight="bold"
                    >
                        {t("profile.index.id")}: {user?.id}
                    </ThemedText>

                    {isStudent && (
                        <View style={styles.chips}>
                            <ChipItem
                                label={t("profile.index.age")}
                                value={user?.age?.toString() || "-"}
                            />
                            <ChipItem
                                label={t("profile.index.level")}
                                value={user?.next_course_id?.toString() || "-"}
                            />
                            <ChipItem
                                label={t("profile.index.code")}
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
                            {t("profile.index.language")}
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

                    <InfoRow
                        label={t("profile.index.phone")}
                        value={user?.mobile!}
                    />
                    {isStudent && (
                        <>
                            <InfoRow
                                label={t("profile.index.parentPhone")}
                                value={user?.parent_number! || "-"}
                            />
                            <View style={styles.subscriptionContainer}>
                                <ThemedText
                                    style={styles.subscriptionLabel}
                                    fontSize={13}
                                >
                                    {t("profile.index.subscription")}
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
                        <InfoRow
                            label={t("profile.index.currentGroups")}
                            value={"-"}
                        />
                    )}
                    <InfoRow
                        label={t("profile.index.address")}
                        value={user?.address || "-"}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutRow}
                    onPress={() => logout()}
                >
                    <ThemedText style={styles.logoutText} fontSize={14}>
                        {t("profile.index.logOut")}
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
        color: Palette.slate500,
    },
    languageActiveText: {
        color: Palette.white,
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
        color: "#EF4444",
        textTransform: "capitalize",
    },
});
