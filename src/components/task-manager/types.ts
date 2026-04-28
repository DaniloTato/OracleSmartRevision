import type { Task, TaskStatus, TaskType } from '../../types/Task'

export interface TaskCardProps {
    task: Task

    onUpdateStatus?: (taskId: number, status: TaskStatus) => void
    onDelete: (taskId: number) => void

    isAssignedViaAI?: boolean
    isHighlighted?: boolean
}

export type Option<T> = { value: T; label: string }

export interface Filters {
    tipo: '' | TaskType
    estado: '' | TaskStatus
    sprintId: string
}
