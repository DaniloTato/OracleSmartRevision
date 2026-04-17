/**
 * Sprint health heuristic: time elapsed vs progress, overdue tasks, overloaded people.
 * All computed locally from mock data; no API. Optional reference date for testing.
 */

import type { Sprint } from '../types'
import { getSprintById } from '../mock'
import {
  getSprintProgressPercent,
  getOverdueTasks,
  getOverloadedPeople,
} from './dashboard'

export type SprintHealthStatus = 'excelente' | 'en_tiempo' | 'en_riesgo'

export interface SprintHealthResult {
  status: SprintHealthStatus
  /** Short explanation in Spanish for the UI */
  explanation: string
}

/**
 * Percentage of sprint duration elapsed as of a given date (0–100).
 * Uses sprint start/end; before start returns 0, after end returns 100.
 */
export function getTimeElapsedPercent(
  sprint: Sprint,
  asOfDate: Date = new Date()
): number {
  const start = new Date(sprint.startDate).getTime()
  const end = new Date(sprint.endDate).getTime()
  const asOf = asOfDate.getTime()
  if (asOf <= start) return 0
  if (asOf >= end) return 100
  const pct = ((asOf - start) / (end - start)) * 100
  return Math.round(pct)
}

/**
 * Compute sprint health status and explanation from progress, time elapsed, overdue tasks, and overloaded people.
 * Optional asOfDate for reproducible tests or demos (default: today).
 */
export function getSprintHealth(
  sprintId: string,
  asOfDate: Date = new Date()
): SprintHealthResult | null {
  const sprint = getSprintById(sprintId)
  if (!sprint) return null

  const progress = getSprintProgressPercent(sprintId)
  const timeElapsed = getTimeElapsedPercent(sprint, asOfDate)
  const overdueTasks = getOverdueTasks(sprintId)
  const overloadedPeople = getOverloadedPeople(sprintId)
  const overdueCount = overdueTasks.length
  const overloadedCount = overloadedPeople.length

  const THRESHOLD = 10
  const progressAhead = progress >= timeElapsed + THRESHOLD
  const progressBehind = progress < timeElapsed - THRESHOLD
  const withinRange = Math.abs(progress - timeElapsed) <= THRESHOLD

  if (progressAhead && overdueCount === 0) {
    return {
      status: 'excelente',
      explanation: 'El avance del sprint supera el tiempo transcurrido y no hay tareas atrasadas.',
    }
  }

  if (overloadedCount >= 1 && overdueCount >= 2) {
    return {
      status: 'en_riesgo',
      explanation: 'Hay personas con sobrecarga y varias tareas atrasadas. Conviene revisar prioridades.',
    }
  }

  if (progressBehind || overdueCount > 2) {
    return {
      status: 'en_riesgo',
      explanation: 'El avance va por debajo del tiempo transcurrido o hay muchas tareas atrasadas.',
    }
  }

  if (withinRange && overdueCount <= 2) {
    return {
      status: 'en_tiempo',
      explanation: 'El avance está alineado con el tiempo transcurrido del sprint.',
    }
  }

  return {
    status: 'en_riesgo',
    explanation: 'Hay tareas atrasadas o desalineación entre avance y tiempo del sprint.',
  }
}
