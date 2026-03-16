import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

function ChipItem({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.chipContainer}>
            <View style={styles.valueBubble}>
                <ThemedText style={styles.valueText} fontSize={10}>
                    {value}
                </ThemedText>
            </View>
            <View style={styles.chip}>
                <ThemedText
                    style={styles.labelText}
                    fontSize={10}
                    fontWeight="medium"
                >
                    {label}
                </ThemedText>
            </View>
        </View>
    );
}

export default ChipItem;

const styles = StyleSheet.create({
    chipContainer: {
        alignItems: "center", // centers both children horizontally
        paddingTop: 10, // space for the bubble to overflow above
        minWidth: 70,
    },
    chip: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#24ADE3",
        borderRadius: 19,
        paddingHorizontal: 14,
        paddingTop: 7, // extra top padding so label isn't hidden behind bubble
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70,
    },
    valueBubble: {
        backgroundColor: "#24ADE3",
        borderWidth: 1.5,
        borderColor: "#E9F7FC",
        borderRadius: 50,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        marginBottom: -12, // pulls bubble down to overlap the chip top edge
    },
    labelText: {
        color: "#A4A3A3",
        textTransform: "capitalize",
        fontWeight: "400",
    },
    valueText: {
        color: "#FFFFFF",
        textTransform: "capitalize",
        fontWeight: "600",
    },
});
