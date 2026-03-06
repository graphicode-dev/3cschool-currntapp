/**
 * tasks_store.ts
 * ──────────────
 * Zustand store for user tasks. Persists via expo-secure-store.
 * Drop-in replacement for tasks_storage.ts / Storage util.
 * Call useTasksStore.getState().clearTasks() on logout.
 */

import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TaskStatus = "todo" | "done";

export interface Task {
    id: string;
    title: string;
    subtitle: string;
    status: TaskStatus;
}

interface TasksStore {
    tasks: Task[];
    addTask: (title: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    clearTasks: () => void;
}

/** Keep todo items above done items */
const sortTasks = (tasks: Task[]): Task[] => [
    ...tasks.filter((t) => t.status === "todo"),
    ...tasks.filter((t) => t.status === "done"),
];

export const useTasksStore = create<TasksStore>()(
    persist(
        (set) => ({
            tasks: [],

            addTask: (title: string) =>
                set((state) => ({
                    tasks: sortTasks([
                        {
                            id: Date.now().toString(),
                            title: title.trim(),
                            subtitle: "Tap to mark as done",
                            status: "todo",
                        },
                        ...state.tasks,
                    ]),
                })),

            toggleTask: (id: string) =>
                set((state) => ({
                    tasks: sortTasks(
                        state.tasks.map((t) =>
                            t.id === id
                                ? {
                                      ...t,
                                      status:
                                          t.status === "todo" ? "done" : "todo",
                                  }
                                : t,
                        ),
                    ),
                })),

            deleteTask: (id: string) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),

            clearTasks: () => set({ tasks: [] }),
        }),
        {
            name: "user-tasks",
            storage: createJSONStorage(() => ({
                getItem: (name) => SecureStore.getItemAsync(name),
                setItem: (name, value) => SecureStore.setItemAsync(name, value),
                removeItem: (name) => SecureStore.deleteItemAsync(name),
            })),
        },
    ),
);
