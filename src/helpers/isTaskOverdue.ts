import type { Task } from "../types/Task"

export function isTaskOverdue(task: Task) {
    if (!task.dueDate) return false
    return new Date(task.dueDate).getTime() < Date.now()
}