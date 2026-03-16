import { Icons } from "@/constants/icons";
import { Palette } from "@/constants/theme";
import { router } from "expo-router";
import {
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
    motivational: string;
    continueButtonText: string;
    shareIdeasText: string;
    chatText: string;
};

const HomeInfoSection = ({
    motivational,
    continueButtonText,
    shareIdeasText,
    chatText,
}: Props) => {
    const { width } = useWindowDimensions();
    const scaleFont = (size: number) => Math.round((width / 375) * size);

    return (
        <View style={styles.container}>
            {/* LEFT — BIG CARD */}
            <View style={styles.motivationalCard}>
                <View style={styles.motivationalContent}>
                    <ThemedText
                        style={[styles.motivationalText]}
                        fontSize={scaleFont(25)}
                        fontWeight="bold"
                    >
                        {motivational}
                    </ThemedText>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.continueButton}
                        onPress={() => router.push("/(app)/(tabs)/groups")}
                    >
                        <ThemedText
                            style={[styles.continueButtonText]}
                            fontSize={scaleFont(10)}
                            fontWeight="medium"
                            numberOfLines={1}
                        >
                            {continueButtonText}
                        </ThemedText>

                        <Icons.ArrowIcon size={16} color={Palette.brand[500]} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* RIGHT — SMALL CARDS */}
            <View style={styles.smallCardsContainer}>
                {/* Share ideas */}
                <View style={styles.smallCard}>
                    <Icons.ShareIcon />

                    <ThemedText
                        style={[styles.smallCardText]}
                        fontSize={scaleFont(14)}
                        fontWeight="medium"
                    >
                        {shareIdeasText}
                    </ThemedText>
                </View>

                {/* Chat */}
                <View style={[styles.smallCard, styles.chatCard]}>
                    <Icons.ChatLoveIcon />

                    <ThemedText
                        style={[styles.smallCardText]}
                        fontSize={scaleFont(14)}
                        fontWeight="medium"
                    >
                        {chatText}
                    </ThemedText>
                </View>
            </View>
        </View>
    );
};

export default HomeInfoSection;

const CARD_RADIUS = 28;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },

    /* ================= BIG CARD ================= */

    motivationalCard: {
        flex: 1,
        backgroundColor: Palette.brand[100],
        borderWidth: 1,
        borderColor: "black",
        borderRadius: CARD_RADIUS,
        padding: 18,
        minHeight: 172,
    },

    motivationalContent: {
        flex: 1,
        justifyContent: "space-between",
    },

    motivationalText: {
        fontWeight: "700",
        color: Palette.slate900,
        lineHeight: 40,
    },

    /* ================= BUTTON ================= */

    continueButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: Palette.brand[500],
    },

    continueButtonText: {
        fontWeight: "600",
        color: Palette.brand[500],
    },

    /* ================= RIGHT SIDE ================= */

    smallCardsContainer: {
        flex: 1,
        gap: 12,
    },

    smallCard: {
        flex: 1,
        backgroundColor: Palette.brand[50],
        borderWidth: 1,
        borderColor: "black",
        borderRadius: CARD_RADIUS,
        paddingHorizontal: 16,
        paddingVertical: 14,
        alignItems: "flex-start",
        gap: 10,
    },

    chatCard: {
        backgroundColor: Palette.brand[50],
    },

    smallCardText: {
        flex: 1,
        fontWeight: "600",
        color: Palette.slate900,
        lineHeight: 20,
    },
});
