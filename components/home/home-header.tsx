import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { User } from "@/services/auth/auth.types";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "../avatar";
import { ThemedText } from "../themed-text";

const HomeHeader = ({ user }: { user: User }) => {
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
                <ThemedText style={styles.greetingText}>
                    hi, {user?.full_name}! 👋
                </ThemedText>
            </View>

            {/* Right Side - Notification Icon */}
            <TouchableOpacity style={styles.notificationContainer}>
                <Icons.BellIcon color="black" size={25} />
                <View style={styles.notificationBadge} />
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
        fontSize: 16,
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
    notificationIcon: {
        width: "100%",
        height: "100%",
    },
    notificationBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 5,
    },
});
