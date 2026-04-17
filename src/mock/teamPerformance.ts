/**
 * Mock team performance metrics for "Rendimiento del Equipo" page.
 * No API; computed-style data for display.
 */

import type { TeamMemberPerformance } from '../types'

export const mockTeamPerformance: TeamMemberPerformance[] = [
  {
    userId: 'u2',
    userName: 'Yael Varela',
    role: 'Desarrolladora',
    tasksCompleted: 12,
    tasksInProgress: 1,
    completionRate: 92,
    currentSprintContribution: 35,
  },
  {
    userId: 'u3',
    userName: 'Danilo Tato',
    role: 'Desarrollador',
    tasksCompleted: 8,
    tasksInProgress: 2,
    completionRate: 80,
    currentSprintContribution: 28,
  },
  {
    userId: 'u4',
    userName: 'Sebastián Soria',
    role: 'Desarrollador',
    tasksCompleted: 15,
    tasksInProgress: 0,
    completionRate: 100,
    currentSprintContribution: 22,
  },
  {
    userId: 'u5',
    userName: 'Sebastián Certuche',
    role: 'Desarrollador',
    tasksCompleted: 5,
    tasksInProgress: 1,
    completionRate: 83,
    currentSprintContribution: 15,
  },
]
