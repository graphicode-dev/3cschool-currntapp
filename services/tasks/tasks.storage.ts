import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "@/components/groups/groups-tasks-list-item";

const TASKS_STORAGE_KEY = "user_tasks";

export const tasksStorage = {
  // Get all tasks for current user
  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  },

  // Save all tasks for current user
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  },

  // Add a new task
  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.unshift(task); // Add to beginning
    await this.saveTasks(tasks);
  },

  // Update a task (toggle status)
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      await this.saveTasks(tasks);
    }
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    await this.saveTasks(filteredTasks);
  },

  // Clear all tasks (for logout)
  async clearTasks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing tasks:", error);
    }
  },
};
