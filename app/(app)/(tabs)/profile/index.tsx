import Avatar from "@/components/avatar";
import CustomHeader from "@/components/custom-header";
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

    // const onEditPress = () => {
    //     router.push("/profile/edit");
    // };

    return (
        <ScreenWrapper bgImage={Images.profileBg}>
            <CustomHeader title="Profile" divider />
            <PullToRefreshScrollView
                refetches={[]}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}>
                {/* Edit button */}
                {/* <TouchableOpacity
                    style={styles.editButton}
                    onPress={onEditPress}
                >
                    <Icons.EditIcon size={24} color="black" />
                </TouchableOpacity> */}

                {/* Avatar section */}
                <View style={styles.avatarSection}>
                    <Avatar
                        image={user?.avatar!}
                        name={user?.full_name!}
                        size={102}
                        badge={user?.role_name}
                    />

                    <ThemedText style={styles.profileName} fontSize={16}>
                        {user?.full_name}
                    </ThemedText>
                    {user?.role_name === "user" && (
                        <ThemedText style={styles.profileName} fontSize={14}>
                            Student Code: {user?.student_code}
                        </ThemedText>
                    )}
                    <ThemedText style={styles.profileEmail} fontSize={14}>
                        {user?.email}
                    </ThemedText>
                </View>

                {/* Info card */}
                <View style={styles.infoCard}>
                    {/* English toggle row */}
                    {/* <View style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>
                            English
                        </ThemedText>
                        <Switch
                            value={englishEnabled}
                            onValueChange={setEnglishEnabled}
                            trackColor={{
                                false: Palette.slate50,
                                true: Palette.brand[500],
                            }}
                            thumbColor={Palette.white}
                        />
                    </View> */}
                    <View style={styles.languageRow}>
                        <ThemedText style={styles.languageLabel} fontSize={14}>
                            Language
                        </ThemedText>
                        <TouchableOpacity
                            onPress={toggleLanguage}
                            activeOpacity={0.8}
                            style={styles.languageToggle}>
                            <View
                                style={[
                                    styles.languageOption,
                                    language === "en" && styles.languageActive,
                                ]}>
                                <ThemedText
                                    style={[
                                        styles.languageOptionText,
                                        language === "en" &&
                                            styles.languageActiveText,
                                    ]}
                                    fontSize={13}>
                                    EN
                                </ThemedText>
                            </View>
                            <View
                                style={[
                                    styles.languageOption,
                                    language === "ar" && styles.languageActive,
                                ]}>
                                <ThemedText
                                    style={[
                                        styles.languageOptionText,
                                        language === "ar" &&
                                            styles.languageActiveText,
                                    ]}
                                    fontSize={13}>
                                    AR
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {user?.role_name === "user" && (
                        <InfoRow
                            label="Age"
                            value={user?.age?.toString() || "-"}
                        />
                    )}
                    <InfoRow label="Phone" value={user?.mobile!} />
                    {user?.role_name === "user" && (
                        <>
                            <InfoRow
                                label="Parent Phone"
                                value={user?.parent_number! || "-"}
                            />
                            <InfoRow
                                label="Session Quota"
                                value={user?.session_quota?.toString() || "-"}
                            />
                            <InfoRow
                                label="Level"
                                value={user?.next_course_id?.toString() || "-"}
                            />
                        </>
                    )}
                    {user?.role_name === "teacher" && (
                        <InfoRow label="Current Groups: " value={"-"} />
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutRow}
                    onPress={() => logout()}>
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
        gap: 18,
    },

    profileName: {
        fontFamily: "Poppins_600SemiBold",
        color: Palette.slate500,
        textTransform: "capitalize",
        textAlign: "center",
    },
    profileEmail: {
        fontFamily: "Poppins_400Regular",
        color: Palette.slate300,
        textAlign: "center",
    },

    // Language toggle
    languageRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 4,
    },
    languageLabel: {
        fontFamily: "Poppins-SemiBold",
        color: Palette.slate500,
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
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    languageActive: {
        backgroundColor: Palette.brand[500],
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
        paddingVertical: 14,
    },
    divider: {
        height: 1,
        backgroundColor: Palette.brand[100],
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
