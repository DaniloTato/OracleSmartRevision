/**
 * Mock tasks for Task Manager and dashboard summaries.
 * Fully normalized to number-based IDs.
 */

import type { Task } from '../types'

export const mockTasks: Task[] = [
   {
      id: 1,
      title: 'Configurar pipeline CI/CD',
      description: 'Configurar GitHub Actions para builds y tests automáticos.',
      status: 'closed',
      priority: 'alta',
      type: 'TASK',
      assigneeId: 2,
      sprintId: 3,
      createdAt: '2025-02-03',
      estimatedHours: 8,
      actualHours: 10,
      isVisible: true,
      featureId: 0,
   },
]

export function getTasksBySprint(sprintId: number): Task[] {
   return mockTasks.filter((t) => t.sprintId === sprintId)
}

export function getTaskById(id: number): Task | undefined {
   return mockTasks.find((t) => t.id === id)
}
