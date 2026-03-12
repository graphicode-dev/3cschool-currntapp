import { Palette } from "@/constants/theme";
import { SessionWithInfo } from "@/services/sessions/sessions.types";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import SessionsListItem from "./sessions-list-item";

type Props = {
    sessions: SessionWithInfo[];
    title: string;
    count?: number;
};

const SessionsList = ({ sessions, title, count }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">{title}</ThemedText>
                {!!count && (
                    <View style={styles.countContainer}>
                        <ThemedText style={styles.count} type="default">
                            {count}
                        </ThemedText>
                    </View>
                )}
            </View>

            {sessions.map((session, i) => (
                <View key={session.id}>
                    {i > 0 && <View style={styles.separator} />}
                    <SessionsListItem session={session} />
                </View>
            ))}
        </View>
    );
};

export default SessionsList;

const styles = StyleSheet.create({
    container: { width: "100%", gap: 12 },
    header: { flexDirection: "row", alignItems: "center", gap: 8 },
    countContainer: {
        backgroundColor: Palette.brand[50],
        borderRadius: 500,
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    count: { color: Palette.brand[500] },
    separator: { height: 12 },
});
