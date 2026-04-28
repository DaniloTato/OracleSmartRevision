export type TaskStatus = 'open' | 'in_progress' | 'closed'
export type TaskType = 'TASK' | 'BUG' | 'TRAINING'

export interface Task {
    id: number
    projectId: number
    sprintId: number
    featureId: number

    title: string
    description?: string

    status: TaskStatus
    type: TaskType

    assigneeId: number | null

    createdAt: string
    updatedAt: string

    estimatedHours?: number
    actualHours: number

    isVisible: boolean
    dueDate: Date
}

export interface CreateTaskDto {
    title: string
    description?: string

    type: TaskType
    status?: TaskStatus

    estimatedHours?: number
    actualHours?: number

    featureId: number
    assigneeId?: number | null

    isVisible?: boolean
}
