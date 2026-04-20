import {
  HiOutlineViewGrid,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
} from 'react-icons/hi'

import { useEffect, useState, useMemo } from 'react'

import {
  getSprints,
  getKpiSummary,
  getTasksByUser,
  getIssuesBySprint,
  getUsers
} from '../api/dashboardApi'

import { useSprint } from '../context/SprintContext'
import { GenericBarChart } from '../components/charts/GenericBarChart'

import { Section } from '../components/ui/Section'
import { KpiCard } from '../components/ui/KpiCard'

export function Dashboard() {

  const projectId = 1

  const [sprints, setSprints] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [tasksByUser, setTasksByUser] = useState<any[]>([])
  const [hoursByUser, setHoursByUser] = useState<any[]>([])

  const [users, setUsers] = useState<any[]>([])

  const { selectedSprintId } = useSprint()
  const activeSprint = sprints.find((s: any) => s.id === selectedSprintId)

  const completedCount = useMemo(() => {
    return tasksByUser.reduce((sum, u) => sum + (u.tasksCompleted ?? 0), 0)
  }, [tasksByUser])

  const progressPercent = (completedCount/summary?.totalTasks) * 100
  const toDoCount = summary?.totalTasks - completedCount

  const estimatedVsRealRows = hoursByUser

  useEffect(() => {
    async function load() {
      const sprintsRes = await getSprints(projectId)

      const activeSprint = 1

      const [summaryRes, tasksRes, issuesRes, usersRes] = await Promise.all([
        getKpiSummary(projectId),
        getTasksByUser(projectId, activeSprint),
        getIssuesBySprint(projectId, activeSprint),
        getUsers()
      ])

      const hoursGrouped = groupHoursByUser(issuesRes)

      setSummary(summaryRes)
      setTasksByUser(tasksRes)
      setHoursByUser(hoursGrouped)
      setSprints(sprintsRes)
      setUsers(usersRes)
    }

    load()
  }, [])

  const tasksChartData = useMemo(() => {
    return tasksByUser.map(u => ({
      label: u.user,
      value: u.tasksCompleted,
    }))
  }, [tasksByUser])

  const usersMap = useMemo(() => {
    const map = new Map<number, string>()
    users.forEach(u => map.set(u.id, u.name))
    return map
  }, [users])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
          <HiOutlineViewGrid className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Resumen del sprint y métricas del equipo
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <KpiCard
          title="Tareas Completadas"
          value={completedCount}
          subtitle="Sprint actual"
          icon={HiOutlineCheckCircle}
          color="data-2"
        />

        <KpiCard
          title="Por Hacer"
          value={toDoCount}
          subtitle="Sprint actual"
          icon={HiOutlineClipboardList}
          color="data-4"
        />
      </div>

      {/* Estado */}
      {activeSprint && (
        <Section title="Estado del Sprint">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {activeSprint.name} — {formatDate(activeSprint.startDate)} a{' '}
            {formatDate(activeSprint.endDate)}
          </p>

          <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[var(--color-primary-light)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2 text-sm flex justify-between">
            <span>Progreso</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
        </Section>
      )}

      {/* Finished tasks per member chart */}
      <Section title="Tareas terminadas por miembro">

        <GenericBarChart
          data={tasksChartData}
          title="Tareas completadas por integrante"
          description="Comparación de desempeño por desarrollador en el sprint seleccionado"
          xAxisLabel="Número de tareas completadas"
          valueLabel="Tareas completadas"
        />
      </Section>

      {/* Real Hours Per Developer */}
      {activeSprint && (
        <Section title="Numero de horas trabajadas por miembro">
          <GenericBarChart
            data={estimatedVsRealRows.map(u => ({
              label: usersMap.get(u.userId) ?? `User ${u.userId}`,
              value: u.actualHours
            }))}
            title="Horas reales por integrante"
            description="Cantidad de horas registradas en el sprint actual"
            xAxisLabel="Horas reales trabajadas"
            valueLabel="Horas reales trabajadas"
          />
        </Section>
      )}
      
    </div>
  )
}

/* ===== helpers ===== */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES')
}

function groupHoursByUser(issues: any[]) {
  const map = new Map<number, number>()

  for (const issue of issues) {
    if (!issue.assigneeId) continue

    const prev = map.get(issue.assigneeId) ?? 0
    map.set(issue.assigneeId, prev + (issue.actualHours ?? 0))
  }

  return Array.from(map.entries()).map(([userId, hours]) => ({
    userId,
    actualHours: hours,
  }))
}