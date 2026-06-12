import type { Task } from '../types/Task'

export function isTaskLate(task: Task): boolean {
    if (!task.dueDate || task.status === 'closed') {
        return false
    }

    return new Date(task.dueDate).getTime() < new Date().getTime()
}
