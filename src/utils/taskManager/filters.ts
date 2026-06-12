import type { Task, TaskStatus, TaskType } from '../../types/Task'

interface Filters {
    tipo: '' | TaskType
    estado: '' | TaskStatus
    sprintId: string
}

export function filterBoardTasks(tasks: Task[], filters: Filters): Task[] {
    return tasks.filter((task) => {
        const assignedMatch = task.assigneeId != null

        const sprintMatch =
            filters.sprintId === '' ||
            String(task.sprintId) === filters.sprintId

        const statusMatch =
            filters.estado === '' || task.status === filters.estado

        const typeMatch = filters.tipo === '' || task.type === filters.tipo

        return assignedMatch && sprintMatch && statusMatch && typeMatch
    })
}
