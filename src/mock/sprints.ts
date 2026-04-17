/**
 * Mock sprints data for Sprint selector and dashboard.
 * No API calls; used for dropdown and filtering.
 */

import type { Sprint } from '../types'

export const mockSprints: Sprint[] = [
  {
    id: 1,
    name: 'Sprint 1 - Q1 2025',
    startDate: '2025-01-06',
    endDate: '2025-01-19',
    status: 'completed',
  },
  {
    id: 2,
    name: 'Sprint 2 - Q1 2025',
    startDate: '2025-01-20',
    endDate: '2025-02-02',
    status: 'completed',
  },
  {
    id: 3,
    name: 'Sprint 3 - Q1 2025',
    startDate: '2025-02-03',
    endDate: '2025-02-16',
    status: 'active',
  },
  {
    id: 4,
    name: 'Sprint 4 - Q1 2025',
    startDate: '2025-02-17',
    endDate: '2025-03-02',
    status: 'planned',
  },
]

export function getActiveSprint(): Sprint | undefined {
  return mockSprints.find((s) => s.status === 'active')
}

export function getSprintById(id: number): Sprint | undefined {
  return mockSprints.find((s) => s.id === id)
}

/** Previous sprint by array order (for "Comparativo vs Sprint anterior"). */
export function getPreviousSprint(sprintId: number): Sprint | undefined {
  const idx = mockSprints.findIndex((s) => s.id === sprintId)
  return idx > 0 ? mockSprints[idx - 1] : undefined
}
