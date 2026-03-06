import { Palette } from "@/constants/theme";
import { Image } from "expo-image";
import { JSX } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface AvatarProps {
    image?: string;
    name?: string;
    size?: number;
    badge?: string;
    icon?: JSX.Element;
}
const Avatar = ({ image, name, size, badge, icon }: AvatarProps) => {
    return (
        <View
            style={[
                styles.avatarContainer,
                {
                    width: size,
                    height: size,
                },
            ]}
        >
            <View style={styles.avatarInner}>
                {image ? (
                    <Image
                        source={{ uri: image }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                    />
                ) : icon ? (
                    <View
                        style={[styles.avatarImage, styles.avatarPlaceholder]}
                    >
                        {icon}
                    </View>
                ) : (
                    <View
                        style={[styles.avatarImage, styles.avatarPlaceholder]}
                    >
                        <ThemedText style={styles.avatarInitial}>
                            {name?.charAt(0)?.toUpperCase() || "?"}
                        </ThemedText>
                    </View>
                )}
            </View>
            {badge && (
                <View style={styles.badgeContainer}>
                    <ThemedText style={styles.studentBadgeText}>
                        {badge}
                    </ThemedText>
                </View>
            )}
        </View>
    );
};
export default Avatar;
const styles = StyleSheet.create({
    avatarContainer: {
        borderRadius: 150,
        backgroundColor: Palette.brand[50],
        borderWidth: 1,
        borderColor: Palette.brand[500],
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInner: {
        width: "100%",
        height: "100%",
        borderRadius: 50,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarImage: {
        width: "90%",
        height: "90%",
        borderRadius: 50,
    },
    avatarPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: "bold",
        color: Palette.brand[500],
    },
    badgeContainer: {
        position: "absolute",
        top: 11,
        right: -4,
        backgroundColor: Palette.brand[200],
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Palette.brand[500],
        paddingHorizontal: 6,
    },
    studentBadgeText: {
        fontFamily: "Poppins_400Regular",
        fontSize: 10,
        color: Palette.brand[50],
        textTransform: "capitalize",
    },
});
