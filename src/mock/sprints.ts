/**
 * Mock sprints data for Sprint selector and dashboard.
 * No API calls; used for dropdown and filtering.
 */

import type { Sprint } from '../types'

export const mockSprints: Sprint[] = [
  {
    id: 1,
    name: 'Sprint 1',
    startDate: '2026-02',
    endDate: '2026-03',
    projectId: 1,
  },
  {
    id: 2,
    name: 'Sprint 0',
    startDate: '2026-04',
    endDate: '2026-04',
    projectId: 1,
  }
]

export function getActiveSprint(): Sprint{
  return mockSprints[0]
}

export function getSprintById(id: number): Sprint | undefined {
  return mockSprints.find((s) => s.id === id)
}

/** Previous sprint by array order (for "Comparativo vs Sprint anterior"). */
export function getPreviousSprint(sprintId: number): Sprint | undefined {
  const idx = mockSprints.findIndex((s) => s.id === sprintId)
  return idx > 0 ? mockSprints[idx - 1] : undefined
}
