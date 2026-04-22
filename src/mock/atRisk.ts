/**
 * Mock at-risk data for Dashboard "En Riesgo" panel.
 * Overdue tasks are derived from tasks in utils; this file holds overloaded people.
 */

import type { OverloadedPersonRisk } from '../types'

export const mockOverloadedPeople: OverloadedPersonRisk[] = [
   {
      userId: 2,
      userName: 'Yael Varela',
      currentTasks: 5,
      maxRecommended: 3,
      severity: 'Alta',
   },
   {
      userId: 3,
      userName: 'Danilo Tato',
      currentTasks: 4,
      maxRecommended: 4,
      severity: 'Media',
   },
]
