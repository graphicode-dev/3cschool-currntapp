import { ThemedText } from "@/components/themed-text";
import { useLanguage } from "@/contexts/language-context";
import { Group } from "@/services/groups/groups.types";
import React from "react";
import { StyleSheet, View } from "react-native";
import GroupsListItem from "./groups-list-item";

interface GroupsListProps {
    data: Group[];
}

const GroupsList = ({ data }: GroupsListProps) => {
    const { t } = useLanguage();

    if (!data.length) {
        return (
            <View style={styles.empty}>
                <ThemedText style={styles.emptyText} fontSize={14}>
                    {t("groups.list.noGroupsFound")}
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.carouselContainer}>
            {data.map((group, i) => (
                <View key={group.id}>
                    {i > 0 && <View style={styles.separator} />}
                    <GroupsListItem group={group} />
                </View>
            ))}
        </View>
    );
};

export default GroupsList;

const styles = StyleSheet.create({
    carouselContainer: {
        width: "100%",
    },
    empty: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyText: {
        color: "#7A7A7A",
    },
    separator: { height: 12 },
});
