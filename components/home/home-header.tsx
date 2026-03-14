import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { User } from "@/services/auth/auth.types";
import { useUnreadCount } from "@/services/notifications";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "../avatar";
import { ThemedText } from "../themed-text";

const HomeHeader = ({ user }: { user: User }) => {
    const { data: unreadData } = useUnreadCount();
    const unreadCount = unreadData?.count ?? 0;

    return (
        <View style={styles.container}>
            {/* Left Side */}
            <View style={styles.leftSide}>
                {/* Avatar Container */}
                <Avatar
                    image={user?.avatar!}
                    name={user?.full_name}
                    size={30}
                />

                {/* Greeting ThemedText */}
                <ThemedText style={styles.greetingText} fontSize={16}>
                    hi, {user?.full_name}! 👋
                </ThemedText>
            </View>

            {/* Right Side - Notification Icon */}
            <TouchableOpacity
                style={styles.notificationContainer}
                onPress={() => router.push("/(app)/notifications")}>
                <Icons.BellIcon color="black" size={25} />
                {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                        <ThemedText style={styles.badgeText} fontSize={10}>
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default HomeHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 20,
    },
    leftSide: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    greetingText: {
        fontWeight: "600",
        color: Palette.slate900, // #393838 equivalent
        textTransform: "capitalize",
        fontFamily: "Poppins-SemiBold",
    },
    notificationContainer: {
        position: "relative",
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: Palette.brand[500],
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#FF3B30",
        borderRadius: 50,
        width: 15,
        height: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        color: "white",
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 10,
    },
});
