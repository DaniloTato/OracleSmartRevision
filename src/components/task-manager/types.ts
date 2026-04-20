import type { Task, TaskStatus } from '../../types'
import type { TaskType, TaskPriority } from '../../types'

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
  prioridad: '' | TaskPriority
  estado: '' | TaskStatus
  sprintId: string
}