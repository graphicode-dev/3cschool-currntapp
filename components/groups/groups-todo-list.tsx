import { useLanguage } from "@/contexts/language-context";
import React, { useCallback, useRef } from "react";
import { Alert, Animated, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import GroupsTasksListItem, { Task } from "./groups-todo-list-item";

interface Props {
    tasks: Task[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

// ─── Animated wrapper per row ────────────────────────────────────────────────

const AnimatedItem: React.FC<{
    task: Task;
    index: number;
    onToggle: (id: string) => void;
    onRequestDelete: (id: string) => void;
}> = ({ task, index, onToggle, onRequestDelete }) => {
    const opacity = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    const { t } = useLanguage();

    const handleDelete = useCallback(
        (id: string) => {
            Alert.alert(
                t("common.deleteTask"),
                t("common.removeTask", { task: task.title }),
                [
                    { text: t("common.cancel"), style: "cancel" },
                    {
                        text: t("common.yesDelete"),
                        style: "destructive",
                        onPress: () => {
                            Animated.parallel([
                                Animated.timing(opacity, {
                                    toValue: 0,
                                    duration: 220,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(translateX, {
                                    toValue: 50,
                                    duration: 230,
                                    useNativeDriver: true,
                                }),
                            ]).start(() => onRequestDelete(id));
                        },
                    },
                ],
                { cancelable: true },
            );
        },
        [task.title],
    );

    return (
        <Animated.View
            style={[styles.itemWrap, { opacity, transform: [{ translateX }] }]}
        >
            <GroupsTasksListItem
                task={task}
                onToggle={onToggle}
                onDelete={handleDelete}
                index={index}
            />
        </Animated.View>
    );
};

// ─── Main list — uses .map() instead of FlatList to avoid nested VirtualizedList ──

const GroupsTasksList: React.FC<Props> = ({ tasks, onToggle, onDelete }) => {
    const { t } = useLanguage();

    if (tasks.length === 0) {
        return (
            <View style={styles.empty}>
                <ThemedText style={styles.emptyEmoji} fontSize={44}>
                    ✅
                </ThemedText>
                <ThemedText style={styles.emptyTitle} fontSize={18}>
                    {t("groups.todoList.emptyTitle")}
                </ThemedText>
                <ThemedText style={styles.emptySubtitle} fontSize={14}>
                    {t("groups.todoList.emptySubtitle")}
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.list}>
            {tasks.map((item, index) => (
                <AnimatedItem
                    key={item.id}
                    task={item}
                    index={index}
                    onToggle={onToggle}
                    onRequestDelete={onDelete}
                />
            ))}
        </View>
    );
};

export default GroupsTasksList;

const styles = StyleSheet.create({
    list: { paddingBottom: 32, gap: 12 },
    itemWrap: {
        marginBottom: 12,
    },
    empty: {
        alignItems: "center",
        paddingTop: 60,
        gap: 10,
    },
    emptyEmoji: {
        padding: 10,
    },
    emptyTitle: {
        fontWeight: "700",
        color: "#2d3a4a",
    },
    emptySubtitle: { color: "#a0b4bf", fontStyle: "italic" },
});
