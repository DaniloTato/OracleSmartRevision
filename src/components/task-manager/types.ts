import type { Task, TaskStatus } from '../../types'

export interface TaskCardProps {
  task: Task

  onUpdateStatus?: (taskId: number, status: TaskStatus) => void
  onDelete: (taskId: number) => void

  isAssignedViaAI?: boolean
  isHighlighted?: boolean
}