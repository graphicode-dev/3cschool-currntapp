import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import { DonutChart } from "./groups-donut-chart";

interface ProgressCardProps {
    label: string;
    highlight?: string;
    elapsed: number;
    total: number;
    nextSessionDate?: Date;
    style?: any;
}

export function ProgressCard({
    label,
    highlight,
    elapsed,
    total,
    nextSessionDate,
    style,
}: ProgressCardProps) {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.left}>
                <ThemedText style={styles.label} fontSize={13}>
                    {label}
                </ThemedText>

                {highlight && (
                    <ThemedText
                        style={styles.highlight}
                        fontSize={13}
                        fontWeight="medium"
                    >
                        {highlight}
                    </ThemedText>
                )}
            </View>

            <DonutChart
                elapsed={elapsed}
                total={total}
                nextSessionDate={nextSessionDate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "80%",
        alignSelf: "center",
        height: 72,
        borderRadius: 16,
        backgroundColor: "#FFF3DD",
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 17,
        paddingRight: 12,
        justifyContent: "space-between",
    },
    left: {
        flex: 1,
        gap: 2,
    },
    label: {
        color: "#A4A3A3",
        textTransform: "lowercase",
    },
    highlight: {
        color: "#24ADE3",
        textTransform: "lowercase",
    },
});
