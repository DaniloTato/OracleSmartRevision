import type { Task, TaskStatus, TaskType } from '../../types/Task'

interface Filters {
    tipo: '' | TaskType
    estado: '' | TaskStatus
    sprintId: string
}

export function filterBoardTasks(tasks: Task[], filters: Filters): Task[] {
    return tasks.filter(
        (t) =>
            t.assigneeId != null &&
            (filters.sprintId === '' || String(t.sprintId) === filters.sprintId)
    )
}
