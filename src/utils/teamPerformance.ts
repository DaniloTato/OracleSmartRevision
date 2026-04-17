/**
 * Team performance metrics computed from mock tasks. No API; front-end heuristics only.
 */

import { mockTasks, getTasksBySprint } from '../mock/tasks'
import { mockUsers } from '../mock/users'
import { mockSprints } from '../mock/sprints'
import { getActiveSprint } from '../mock/sprints'
import type { Task, TaskType } from '../types'

const ACTIVE_SPRINT_ID = getActiveSprint()?.id ?? 3

export interface TeamPerformanceRow {
  userId: number
  userName: string
  role: string
  tareasActivas: number
  completadasSprintActual: number
  promedioVariacion: number
  scoreProductividad: number
  tendencia: 'up' | 'down'
  cargaHoras: number
}

/** Tasks considered "active" (in progress, not done) */
const ACTIVE_STATUSES = ['pendiente', 'en_progreso', 'revisión'] as const

function isActive(task: Task): boolean {
  return ACTIVE_STATUSES.includes(task.status as typeof ACTIVE_STATUSES[number])
}

export interface TaskStatusSlice {
  name: string
  value: number
  fill: string
}

function taskStatusSlicesFromTasks(tasks: Task[]): TaskStatusSlice[] {
  let completadas = 0
  let pendientes = 0
  let enProgreso = 0
  for (const t of tasks) {
    if (t.status === 'closed') completadas++
    else if (t.status === 'open') pendientes++
    else enProgreso++
  }
  const slices: TaskStatusSlice[] = [
    { name: 'Completadas', value: completadas, fill: '#059669' },
    { name: 'Pendientes', value: pendientes, fill: '#94a3b8' },
    { name: 'En progreso', value: enProgreso, fill: '#f97316' },
  ]
  return slices.filter((s) => s.value > 0)
}

/** Distribución de tareas del sprint (todas las tareas del sprint). */
export function getTaskStatusDistributionForSprint(sprintId: number): TaskStatusSlice[] {
  return taskStatusSlicesFromTasks(getTasksBySprint(sprintId))
}

/** Distribución de estados solo para las tareas asignadas a un integrante en el sprint. */
export function getTaskStatusDistributionForMember(
  sprintId: number,
  userId: number
): TaskStatusSlice[] {
  const tasks = getTasksBySprint(sprintId).filter((t) => t.assigneeId === userId)
  return taskStatusSlicesFromTasks(tasks)
}

export function getTeamPerformanceRows(): TeamPerformanceRow[] {
  return mockUsers.map((user) => {
    const userTasks = mockTasks.filter((t) => t.assigneeId === user.id)
    const activeTasks = userTasks.filter(isActive)
    const completedCurrentSprint = userTasks.filter(
      (t) => t.sprintId === ACTIVE_SPRINT_ID && t.status === 'closed'
    )
    const withVariance = userTasks.filter(
      (t) => t.estimatedHours != null && t.actualHours != null && t.status === 'closed'
    )
    const avgVariation =
      withVariance.length > 0
        ? withVariance.reduce((s, t) => s + (t.actualHours! - t.estimatedHours!), 0) / withVariance.length
        : 0
    const cargaHoras = activeTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0)
    const completionRate = userTasks.length > 0
      ? Math.round((userTasks.filter((t) => t.status === 'closed').length / userTasks.length) * 100)
      : 0
    const lowVariationBonus = Math.abs(avgVariation) <= 2 ? 10 : Math.abs(avgVariation) <= 4 ? 5 : 0
    const scoreProductividad = Math.min(100, Math.max(0, completionRate + lowVariationBonus))
    const tendencia: 'up' | 'down' = completionRate >= 80 ? 'up' : 'down'
    return {
      userId: user.id,
      userName: user.name,
      role: user.role,
      tareasActivas: activeTasks.length,
      completadasSprintActual: completedCurrentSprint.length,
      promedioVariacion: Math.round(avgVariation * 10) / 10,
      scoreProductividad,
      tendencia,
      cargaHoras,
    }
  })
}

export interface MemberDetailKpis {
  tareasActivas: number
  completadasSprintActual: number
  promedioVariacion: number
  scoreProductividad: number
  tendencia: 'up' | 'down'
  cargaHoras: number
}

export interface MemberDetail {
  userId: number
  userName: string
  role: string
  kpis: MemberDetailKpis
  lastTasks: Task[]
  strengths: string[]
  sprintHistory: { sprintId: number; sprintName: string; completed: number; total: number }[]
}

export function getMemberDetail(userId: number): MemberDetail | null {
  const user = mockUsers.find((u) => Number(u.id) === userId)
  if (!user) return null
  const row = getTeamPerformanceRows().find((r) => r.userId === userId)
  if (!row) return null

  const userTasks = mockTasks.filter((t) => t.assigneeId === userId)
  const lastTasks = [...userTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const completedByType = userTasks
    .filter((t) => t.status === 'closed')
    .reduce<Record<string, number>>((acc, t) => {
      const type = t.type ?? 'feature'
      acc[type] = (acc[type] ?? 0) + 1
      return acc
    }, {})
  const bestType = (Object.entries(completedByType) as [TaskType, number][])
    .sort((a, b) => b[1] - a[1])[0]
  const typeLabels: Record<string, string> = {
    feature: 'Features',
    bug: 'Bugs',
    issue: 'Issues',
    capacitación: 'Capacitación',
  }
  const strengths: string[] = []
  if (bestType) {
    strengths.push(`Rinde mejor en: ${typeLabels[bestType[0]] ?? bestType[0]} y tareas cortas.`)
  }
  strengths.push('Completa más rápido cuando trabaja en: Backend.')
  const suggestedType = bestType ? bestType[0] : 'feature'
  strengths.push(`Sugerencia IA: asignarle tareas tipo ${typeLabels[suggestedType] ?? suggestedType}.`)

  const sprintHistory = mockSprints.filter((s) => s.status !== 'planned').map((s) => {
    const inSprint = userTasks.filter((t) => t.sprintId === s.id)
    const completed = inSprint.filter((t) => t.status === 'closed').length
    return {
      sprintId: s.id,
      sprintName: s.name,
      completed,
      total: inSprint.length || 1,
    }
  })

  return {
    userId: user.id,
    userName: user.name,
    role: user.role,
    kpis: {
      tareasActivas: row.tareasActivas,
      completadasSprintActual: row.completadasSprintActual,
      promedioVariacion: row.promedioVariacion,
      scoreProductividad: row.scoreProductividad,
      tendencia: row.tendencia,
      cargaHoras: row.cargaHoras,
    },
    lastTasks,
    strengths,
    sprintHistory,
  }
}
