import type { TaskPriority, TaskStatus, TaskType } from '../../types'

export const TYPE_LABELS: Record<TaskType, string> = {
  TASK: 'Task',
  BUG: 'Bug',
  TRAINING: 'Capacitación',
}

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'open', label: 'To Do' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'closed', label: 'Hecho' },
]

export const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  baja: 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
  media: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
  alta: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
}