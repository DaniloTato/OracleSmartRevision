import type { TaskStatus, TaskType } from '../../types/Task'

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