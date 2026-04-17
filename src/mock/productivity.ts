/**
 * Mock productivity timeseries: baseline "Antes" vs current "Después" per user.
 * Used for line chart "Medición de la productividad". No API; frontend only.
 */

import { mockUsers } from './users'
import { mockSprints } from './sprints'

export interface ProductivityPoint {
  /** X-axis label (e.g. "Sprint 1 - Q1 2025" or "Semana 1") */
  label: string
  /** Baseline productivity score (0-100) */
  antes: number
  /** Current productivity score (0-100) */
  despues: number
}

export interface UserProductivity {
  userId: number
  points: ProductivityPoint[]
}

/** Sprints used as timeline (completed + active). Fallback to Semana 1..8 if fewer sprints. */
const SPRINTS_FOR_TIMELINE = mockSprints.filter(
  (s) => s.status === 'completed' || s.status === 'active'
)
const FALLBACK_LABELS = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5', 'Semana 6', 'Semana 7', 'Semana 8']
const TIMELINE_LABELS = SPRINTS_FOR_TIMELINE.length >= 6
  ? SPRINTS_FOR_TIMELINE.map((s) => s.name)
  : FALLBACK_LABELS

/** Generate mock points: "antes" = baseline trend, "despues" = current (slightly improved). */
function generatePointsForUser(): ProductivityPoint[] {
  return TIMELINE_LABELS.map((label, i) => {
    const base = 55 + Math.sin(i * 0.8) * 12 + (i * 2)
    const antes = Math.round(Math.min(100, Math.max(0, base)))
    const despues = Math.round(Math.min(100, Math.max(0, base + 5 + (i * 1.5))))
    return {
      label,
      antes,
      despues,
    }
  })
}

/** Mock productivity series: one entry per user with 6–8 points. */
export const mockProductivityByUser: UserProductivity[] = mockUsers.map((user) => ({
  userId: user.id,
  points: generatePointsForUser(),
}))

/** Get productivity series for a user by id. */
export function getProductivityByUserId(userId: number): UserProductivity | undefined {
  return mockProductivityByUser.find((u) => u.userId === userId)
}
