import { useLanguage } from "@/contexts/language-context";
import { useTasksStore } from "@/services/tasks/tasks.store";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "../themed-text";
import GroupsTasksList from "./groups-todo-list";

type Filter = "all" | "todo" | "done";

const GroupsMyTasks: React.FC = () => {
    const { t } = useLanguage();
    const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
    const [inputValue, setInputValue] = useState("");
    const [filter, setFilter] = useState<Filter>("todo");
    const addBtnScale = useRef(new Animated.Value(1)).current;

    const todoCount = tasks.filter((t) => t.status === "todo").length;
    const doneCount = tasks.filter((t) => t.status === "done").length;

    const visibleTasks =
        filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

    const handleAddTask = useCallback(() => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        Animated.sequence([
            Animated.timing(addBtnScale, {
                toValue: 0.72,
                duration: 85,
                useNativeDriver: true,
            }),
            Animated.spring(addBtnScale, {
                toValue: 1,
                tension: 80,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        addTask(trimmed);
        setInputValue("");
    }, [inputValue, addTask]);

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                {/* Add input */}
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder={t("common.addTask")}
                        placeholderTextColor="#b0c8d4"
                        value={inputValue}
                        onChangeText={setInputValue}
                        onSubmitEditing={handleAddTask}
                        returnKeyType="done"
                    />
                    <Animated.View
                        style={{ transform: [{ scale: addBtnScale }] }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                !inputValue.trim() && styles.addButtonDisabled,
                            ]}
                            onPress={handleAddTask}
                            activeOpacity={0.85}
                        >
                            <ThemedText
                                style={styles.addButtonIcon}
                                fontSize={22}
                            >
                                ＋
                            </ThemedText>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Filter chips — tap to filter, tap again to show all */}
                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={[
                            styles.statChip,
                            filter === "todo" && styles.statChipTodoActive,
                        ]}
                        onPress={() =>
                            setFilter((prev) =>
                                prev === "todo" ? "all" : "todo",
                            )
                        }
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.statNumber} fontSize={14}>
                            {todoCount}
                        </ThemedText>
                        <ThemedText style={styles.statLabel} fontSize={13}>
                            {t("groups.myTasks.toDo")}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.statChip,
                            styles.statChipDone,
                            filter === "done" && styles.statChipDoneActive,
                        ]}
                        onPress={() =>
                            setFilter((prev) =>
                                prev === "done" ? "all" : "done",
                            )
                        }
                        activeOpacity={0.8}
                    >
                        <ThemedText
                            style={[styles.statNumber, styles.statNumberDone]}
                            fontSize={14}
                        >
                            {doneCount}
                        </ThemedText>
                        <ThemedText
                            style={[styles.statLabel, styles.statLabelDone]}
                            fontSize={13}
                        >
                            {" "}
                            {t("groups.myTasks.done")}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Task list */}
                <GroupsTasksList
                    tasks={visibleTasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

export default GroupsMyTasks;

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        paddingLeft: 20,
        paddingRight: 8,
        paddingVertical: 8,
        marginBottom: 14,
        shadowColor: "#a0d8ef",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1.5,
        borderColor: "#c8eaf6",
    },
    input: { flex: 1, fontSize: 15, color: "#2d3a4a", paddingVertical: 8 },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#4DC8E0",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4DC8E0",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    addButtonDisabled: { backgroundColor: "#a8dce8", shadowOpacity: 0.08 },
    addButtonIcon: {
        color: "#ffffff",
        fontWeight: "300",
        lineHeight: 26,
    },

    statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },

    statChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ede8f8",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1.5,
        borderColor: "transparent",
    },
    statChipTodoActive: {
        borderColor: "#9b85d9",
        backgroundColor: "#e0d9f8",
    },
    statChipDone: { backgroundColor: "#e2f7ed" },
    statChipDoneActive: {
        borderColor: "#4cba7e",
        backgroundColor: "#d4f0e2",
    },

    statNumber: { fontWeight: "700", color: "#9b85d9" },
    statNumberDone: { color: "#4cba7e" },
    statLabel: { color: "#9b85d9", fontWeight: "500" },
    statLabelDone: { color: "#4cba7e" },
});
