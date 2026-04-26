import type { Task, TaskStatus, TaskType} from '../../types/Task'

interface Filters {
   tipo: '' | TaskType
   estado: '' | TaskStatus
   sprintId: string
}

export function filterPoolTasks(tasks: Task[], filters: Filters): Task[] {
   return tasks.filter(
      (t) =>
         t.assigneeId == null &&
         (filters.sprintId === '' || String(t.sprintId) === filters.sprintId) &&
         (filters.tipo === '' || t.type === filters.tipo) &&
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
