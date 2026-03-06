import { Palette } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>{label}</ThemedText>
            <ThemedText style={styles.infoValue}>{value}</ThemedText>
        </View>
    );
}

export default InfoRow;

const styles = StyleSheet.create({
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
    },
    infoLabel: {
        fontFamily: "Poppins_500Medium",
        fontSize: 13,
        color: Palette.slate500,
        textTransform: "capitalize",
    },
    infoValue: {
        fontFamily: "Poppins_500Medium",
        fontSize: 13,
        color: Palette.brand[500],
        textTransform: "capitalize",
    },
});
