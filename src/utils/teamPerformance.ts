import type { Task } from '../types/index'
import type { MemberDetail, TaskStatusSlice } from '../types/teamPerformance'

export function buildTaskStatusDistribution(tasks: Task[]): TaskStatusSlice[] {
  let completadas = 0
  let pendientes = 0
  let enProgreso = 0

  for (const t of tasks) {
    if (t.status === 'closed') completadas++
    else if (t.status === 'open') pendientes++
    else enProgreso++
  }

  return [
    { name: 'Completadas', value: completadas, fill: '#059669' },
    { name: 'Pendientes', value: pendientes, fill: '#94a3b8' },
    { name: 'En progreso', value: enProgreso, fill: '#f97316' },
  ].filter((s) => s.value > 0)
}

export function buildMemberDetail(params: {
  user: { id: number; name: string; role: string }
  tasks: Task[]
  allSprints: { id: number; name: string }[]
  activeSprintId: number
}): MemberDetail {
  const { user, tasks, allSprints, activeSprintId } = params

  const userTasks = tasks.filter((t) => t.assigneeId === user.id)

  const activeTasks = userTasks.filter(
    (t) => t.status !== 'closed'
  )

  const completedCurrentSprint = userTasks.filter(
    (t) => t.sprintId === activeSprintId && t.status === 'closed'
  )

  const withVariance = userTasks.filter(
    (t) =>
      t.estimatedHours != null &&
      t.actualHours != null &&
      t.status === 'closed'
  )

  const avgVariation =
    withVariance.length > 0
      ? withVariance.reduce(
          (s, t) => s + (t.actualHours! - t.estimatedHours!),
          0
        ) / withVariance.length
      : 0

  const cargaHoras = activeTasks.reduce(
    (s, t) => s + (t.estimatedHours ?? 0),
    0
  )

  const completionRate =
    userTasks.length > 0
      ? Math.round(
          (userTasks.filter((t) => t.status === 'closed').length /
            userTasks.length) *
            100
        )
      : 0

  const bonus =
    Math.abs(avgVariation) <= 2
      ? 10
      : Math.abs(avgVariation) <= 4
      ? 5
      : 0

  const scoreProductividad = Math.min(
    100,
    Math.max(0, completionRate + bonus)
  )

  const tendencia: 'up' | 'down' =
    completionRate >= 80 ? 'up' : 'down'

  // last tasks
  const lastTasks = [...userTasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 8)

  // strengths
  const completedByType = userTasks
    .filter((t) => t.status === 'closed')
    .reduce<Record<string, number>>((acc, t) => {
      const type = t.type ?? 'TASK'
      acc[type] = (acc[type] ?? 0) + 1
      return acc
    }, {})

  const bestType = Object.entries(
    completedByType
  ).sort((a, b) => b[1] - a[1])[0]

  const typeLabels: Record<string, string> = {
    TASK: 'Features',
    BUG: 'Bugs',
    TRAINING: 'Training',
  }

  const strengths: string[] = []

  if (bestType) {
    strengths.push(
      `Rinde mejor en: ${
        typeLabels[bestType[0]] ?? bestType[0]
      } y tareas cortas.`
    )
  }

  strengths.push('Completa más rápido cuando trabaja en: Backend.')

  const suggestedType = bestType?.[0] ?? 'TASK'

  strengths.push(
    `Sugerencia IA: asignarle tareas tipo ${
      typeLabels[suggestedType] ?? suggestedType
    }.`
  )

  // sprint history
  const sprintHistory = allSprints.map((s) => {
    const inSprint = userTasks.filter(
      (t) => t.sprintId === s.id
    )

    const completed = inSprint.filter(
      (t) => t.status === 'closed'
    ).length

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
      tareasActivas: activeTasks.length,
      completadasSprintActual: completedCurrentSprint.length,
      promedioVariacion: Math.round(avgVariation * 10) / 10,
      scoreProductividad,
      tendencia,
      cargaHoras,
    },
    lastTasks,
    strengths,
    sprintHistory,
  }
}