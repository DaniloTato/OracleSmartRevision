/**
 * Dashboard aggregation utils. All calculations from mock data; no API.
 */

import { getTasksBySprint, getUserDisplayName, mockOverloadedPeople, mockUsers } from '../mock'
import { mockTasks } from '../mock/tasks'
import { getSprintById } from '../mock/sprints'
import type {
  OverdueTaskRisk,
  OverloadedPersonRisk,
  HighVarianceRisk,
  RiskSeverity,
} from '../types'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

/** Sprint progress: completed tasks / total tasks * 100 */
export function getSprintProgressPercent(sprintId: number): number {
  const tasks = getTasksBySprint(sprintId)
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => t.status === 'closed').length
  return Math.round((completed / tasks.length) * 100)
}

/** Number of completed tasks in the sprint */
export function getCompletedTasksCount(sprintId: number): number {
  return getTasksBySprint(sprintId).filter((t) => t.status === 'closed').length
}

export interface CompletedTasksByMemberRow {
  userId: number
  userName: string
  completadas: number
}

/** Completed tasks in the sprint per integrante (excluye administrador). */
export function getCompletedTasksByMember(sprintId: number): CompletedTasksByMemberRow[] {
  const sprintTasks = getTasksBySprint(sprintId)
  const teamMembers = mockUsers.filter((u) => u.role !== 'Administrador')
  return teamMembers.map((u) => ({
    userId: u.id,
    userName: u.name,
    completadas: sprintTasks.filter((t) => t.assigneeId === u.id && t.status === 'closed').length,
  }))
}

/** Number of tasks with status "en_progreso" (En Proceso) in the sprint */
export function getTasksInProgressCount(sprintId: number): number {
  return getTasksBySprint(sprintId).filter((t) => t.status === 'in_progress').length
}

/** Number of tasks with status "pendiente" (Por Hacer / To Do) in the sprint */
export function getTasksToDoCount(sprintId: number): number {
  return getTasksBySprint(sprintId).filter((t) => t.status === 'open').length
}

/** Variance in hours: sum(actualHours - estimatedHours) for tasks with both set */
export function getEstimatedVsRealVarianceHours(sprintId: number): number {
  const tasks = getTasksBySprint(sprintId).filter(
    (t) => t.estimatedHours != null && t.actualHours != null
  )
  return tasks.reduce((sum, t) => sum + (t.actualHours ?? 0) - (t.estimatedHours ?? 0), 0)
}

/** Count of open bugs and issues (not completed) in the sprint */
export function getOpenBugsIssuesCount(sprintId: number): number {
  return getTasksBySprint(sprintId).filter(
    (t) => (t.type === 'BUG') && t.status !== 'closed'
  ).length
}

/** Total estimated hours for unassigned tasks (for deep link badge "Sin asignar: XXh"). */
export function getUnassignedTotalHours(): number {
  return mockTasks
    .filter((t) => t.assigneeId == null)
    .reduce((sum, t) => sum + (t.estimatedHours ?? 0), 0)
}

/** Aggregates for a sprint (for comparativo vs previous sprint). */
export interface SprintAggregates {
  completedCount: number
  varianceHours: number
  openBugsIssuesCount: number
  productivityPercent: number
}

export function getSprintAggregates(sprintId: number): SprintAggregates {
  const tasks = getTasksBySprint(sprintId)
  const completedCount = tasks.filter((t) => t.status === 'closed').length
  const varianceHours = getEstimatedVsRealVarianceHours(sprintId)
  const openBugsIssuesCount = getOpenBugsIssuesCount(sprintId)
  const productivityPercent = getSprintProgressPercent(sprintId)
  return { completedCount, varianceHours, openBugsIssuesCount, productivityPercent }
}

/** Deltas: métricas del sprint "comparar" menos el sprint de referencia (línea base). */
export interface SprintComparisonBetween {
  baselineSprintName: string | null
  compareSprintName: string | null
  completedDelta: number
  varianceHoursDelta: number
  openBugsIssuesDelta: number
  productivityDelta: number
}

/** Comparar dos sprints cualquiera: delta = sprint comparar − sprint referencia. */
export function getSprintComparisonBetween(
  baselineSprintId: number,
  compareSprintId: number
): SprintComparisonBetween | null {
  if (!baselineSprintId || !compareSprintId || baselineSprintId === compareSprintId) return null
  const baseline = getSprintAggregates(baselineSprintId)
  const compare = getSprintAggregates(compareSprintId)
  return {
    baselineSprintName: getSprintById(baselineSprintId)?.name ?? null,
    compareSprintName: getSprintById(compareSprintId)?.name ?? null,
    completedDelta: compare.completedCount - baseline.completedCount,
    varianceHoursDelta: compare.varianceHours - baseline.varianceHours,
    openBugsIssuesDelta: compare.openBugsIssuesCount - baseline.openBugsIssuesCount,
    productivityDelta: compare.productivityPercent - baseline.productivityPercent,
  }
}

/** @deprecated Usar getSprintComparisonBetween(baseline, compare); equivale a compare=current, baseline=previous */
export function getSprintComparisonDeltas(
  currentSprintId: number,
  previousSprintId: number | undefined
): SprintComparisonBetween | null {
  if (!previousSprintId) return null
  return getSprintComparisonBetween(previousSprintId, currentSprintId)
}

/** Alias de tipo para código que aún nombre "Deltas". */
export type SprintComparisonDeltas = SprintComparisonBetween

export interface EstimatedVsRealRow {
  userId: number
  userName: string
  estimatedHours: number
  actualHours: number
}

export function getEstimatedVsRealByPerson(sprintId: number): EstimatedVsRealRow[] {
  const tasks = getTasksBySprint(sprintId)

  const byUser = new Map<number, { estimated: number; actual: number }>()

  for (const t of tasks) {
    if (!t.assigneeId) continue

    const est = t.estimatedHours ?? 0
    const act = t.actualHours ?? 0

    const cur = byUser.get(t.assigneeId) ?? {
      estimated: 0,
      actual: 0,
    }

    byUser.set(t.assigneeId, {
      estimated: cur.estimated + est,
      actual: cur.actual + act,
    })
  }

  return Array.from(byUser.entries()).map(([userId, v]) => ({
    userId,
    userName: getUserDisplayName(userId),
    estimatedHours: v.estimated,
    actualHours: v.actual,
  }))
}

export interface DistributionByType {
  TASK: number
  BUG: number
  TRAINING: number
}

/** Count tasks by type (feature / bug / issue / capacitación) for the sprint */
export function getDistributionByType(sprintId: number): DistributionByType {
  const tasks = getTasksBySprint(sprintId)
  const out: DistributionByType = { TASK: 0, BUG: 0, TRAINING: 0}
  for (const t of tasks) {
    const type = t.type ?? 'TASK'
    out[type] = (out[type] ?? 0) + 1
  }
  return out
}

/** Overdue tasks: due date before today and not completed. Severity from priority. */
export function getOverdueTasks(sprintId: number): OverdueTaskRisk[] {
  const tasks = getTasksBySprint(sprintId).filter((t) => t.status !== 'closed')
  const result: OverdueTaskRisk[] = []
  for (const t of tasks) {
    const due = new Date() // Add when DB supports due dates for tasks
    due.setHours(0, 0, 0, 0)
    if (due >= TODAY) continue
    const severity: RiskSeverity = t.priority === 'alta' ? 'Alta' : t.priority === 'media' ? 'Media' : 'Baja'
    result.push({
      taskId: t.id,
      title: t.title,
      dueDate: "no due date",
      assigneeName: t.assigneeId != null ? getUserDisplayName(t.assigneeId) : 'Sin asignar',
      severity,
    })
  }
  return result
}

/** Overloaded people from mock list (current sprint context; mock is global). */
export function getOverloadedPeople(_sprintId: number): OverloadedPersonRisk[] {
  return [...mockOverloadedPeople]
}

/** High variance: tasks where |actual - estimated| > threshold (e.g. 3h). Severity by variance size. */
const VARIANCE_THRESHOLD_HOURS = 3

export function getHighVarianceItems(sprintId: number): HighVarianceRisk[] {
  const tasks = getTasksBySprint(sprintId).filter(
    (t) => t.estimatedHours != null && t.actualHours != null
  )
  const result: HighVarianceRisk[] = []
  for (const t of tasks) {
    const est = t.estimatedHours ?? 0
    const act = t.actualHours ?? 0
    const variance = act - est
    if (Math.abs(variance) < VARIANCE_THRESHOLD_HOURS) continue
    const severity: RiskSeverity =
      Math.abs(variance) >= 6 ? 'Alta' : Math.abs(variance) >= 4 ? 'Media' : 'Baja'
    result.push({
      taskId: t.id,
      title: t.title,
      assigneeName: t.assigneeId != null ? getUserDisplayName(t.assigneeId) : 'Sin asignar',
      estimatedHours: est,
      actualHours: act,
      varianceHours: variance,
      severity,
    })
  }
  return result
}
