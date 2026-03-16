import { useLanguage } from "@/contexts/language-context";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../themed-text";

export type TaskStatus = "todo" | "done";

export interface Task {
    id: string;
    title: string;
    subtitle: string;
    status: TaskStatus;
}

interface Props {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    index: number;
}

const GroupsTasksListItem: React.FC<Props> = ({
    task,
    onToggle,
    onDelete,
    index,
}) => {
    const { t } = useLanguage();
    const isDone = task.status === "done";

    // Mount: staggered fade + slide-up
    const mountOpacity = useRef(new Animated.Value(0)).current;
    const mountY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(mountOpacity, {
                toValue: 1,
                duration: 360,
                delay: index * 60,
                useNativeDriver: true,
            }),
            Animated.spring(mountY, {
                toValue: 0,
                tension: 55,
                friction: 8,
                delay: index * 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Checkbox bounce
    const checkScale = useRef(new Animated.Value(1)).current;
    const handleToggle = () => {
        Animated.sequence([
            Animated.timing(checkScale, {
                toValue: 0.6,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(checkScale, {
                toValue: 1,
                tension: 90,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start(() => onToggle(task.id));
    };

    // Delete bounce
    const deleteScale = useRef(new Animated.Value(1)).current;
    const handleDeletePress = () => {
        Animated.sequence([
            Animated.timing(deleteScale, {
                toValue: 0.65,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(deleteScale, {
                toValue: 1,
                tension: 80,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start(() => onDelete(task.id));
    };

    return (
        <Animated.View
            style={[
                styles.card,
                isDone && styles.cardDone,
                { opacity: mountOpacity, transform: [{ translateY: mountY }] },
            ]}
        >
            {/* Checkbox */}
            <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
                <Animated.View
                    style={[
                        styles.checkbox,
                        isDone && styles.checkboxDone,
                        { transform: [{ scale: checkScale }] },
                    ]}
                >
                    {isDone && (
                        <ThemedText style={styles.checkmark} fontSize={16}>
                            ✓
                        </ThemedText>
                    )}
                </Animated.View>
            </TouchableOpacity>

            {/* ThemedText */}
            <TouchableOpacity
                style={styles.textContainer}
                onPress={handleToggle}
                activeOpacity={0.7}
            >
                <ThemedText
                    style={[styles.title, isDone && styles.titleDone]}
                    numberOfLines={2}
                    fontSize={14}
                >
                    {task.title}
                </ThemedText>
                <ThemedText
                    style={styles.subtitle}
                    numberOfLines={1}
                    fontSize={12}
                >
                    {task.subtitle}
                </ThemedText>
            </TouchableOpacity>

            {/* Badge */}
            <Animated.View
                style={[
                    styles.badge,
                    isDone ? styles.badgeDone : styles.badgeTodo,
                ]}
            >
                <ThemedText
                    style={[
                        styles.badgeText,
                        isDone ? styles.badgeTextDone : styles.badgeTextTodo,
                    ]}
                    fontSize={12}
                >
                    {isDone ? t("common.done") : t("common.todo")}
                </ThemedText>
            </Animated.View>

            {/* Delete */}
            <Animated.View style={{ transform: [{ scale: deleteScale }] }}>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={handleDeletePress}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ThemedText fontSize={15}>🗑</ThemedText>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

export default GroupsTasksListItem;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        shadowColor: "#a0d8ef",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 3,
    },
    cardDone: {
        backgroundColor: "#f8fefc",
        shadowOpacity: 0.08,
    },
    checkbox: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: "#c8e6f5",
        backgroundColor: "#f0f8ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    checkboxDone: {
        borderColor: "#4DC8E0",
        backgroundColor: "#e8f9fc",
    },
    checkmark: { color: "#4DC8E0", fontWeight: "700" },
    textContainer: { flex: 1, marginRight: 8 },
    title: {
        fontWeight: "600",
        color: "#2d3a4a",
        marginBottom: 3,
        lineHeight: 19,
    },
    titleDone: { color: "#a0b4bf", textDecorationLine: "line-through" },
    subtitle: { color: "#a0b4bf" },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        minWidth: 56,
        alignItems: "center",
        marginRight: 8,
    },
    badgeTodo: { backgroundColor: "#ede8f8" },
    badgeDone: { backgroundColor: "#e2f7ed" },
    badgeText: { fontWeight: "600" },
    badgeTextTodo: { color: "#9b85d9" },
    badgeTextDone: { color: "#4cba7e" },
    deleteBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "#fff0f0",
        alignItems: "center",
        justifyContent: "center",
    },
});
