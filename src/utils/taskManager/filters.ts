import type { Task, TaskStatus, TaskType, TaskPriority } from '../../types'

interface Filters {
  tipo: '' | TaskType
  prioridad: '' | TaskPriority
  estado: '' | TaskStatus
  sprintId: string
}

export function filterPoolTasks(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter(
    (t) =>
      t.assigneeId == null &&
      (filters.sprintId === '' || String(t.sprintId) === filters.sprintId) &&
      (filters.tipo === '' || t.type === filters.tipo) &&
      (filters.prioridad === '' || t.priority === filters.prioridad) &&
      (filters.estado === '' || t.status === filters.estado)
  )
}

export function filterBoardTasks(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter(
    (t) =>
      t.assigneeId != null &&
      (filters.sprintId === '' || String(t.sprintId) === filters.sprintId)
  )
}