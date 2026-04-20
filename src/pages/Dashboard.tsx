import {
  HiOutlineViewGrid,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
} from 'react-icons/hi'

import { useMemo } from 'react'

import { useSprint } from '../context/SprintContext'
import { useDashboardData } from '../hooks/useDashboardData'

import { GenericBarChart } from '../components/charts/GenericBarChart'
import { Section } from '../components/ui/Section'
import { KpiCard } from '../components/ui/KpiCard'

export function Dashboard() {
  const projectId = 1

  const { selectedSprintId } = useSprint()
  const sprintId = selectedSprintId ?? 1

  const {
    sprints,
    summary,
    tasks,
    hours,
    users,
    loading,
  } = useDashboardData(projectId, sprintId)

  const activeSprint = useMemo(
    () => sprints.find(s => s.id === sprintId),
    [sprints, sprintId]
  )

  const completedCount = useMemo(() => {
    return tasks.reduce((sum, u) => sum + (u.tasksCompleted ?? 0), 0)
  }, [tasks])

  const totalTasks = summary?.totalTasks ?? 0

  const progressPercent =
    totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0

  const toDoCount = totalTasks - completedCount

  const tasksChartData = useMemo(() => {
    return tasks.map(u => ({
      label: u.user,
      value: u.tasksCompleted,
    }))
  }, [tasks])

  const usersMap = useMemo(() => {
    const map = new Map<number, string>()
    users.forEach(u => map.set(u.id, u.name))
    return map
  }, [users])

  if (loading) {
    return <div className="p-4">Cargando dashboard...</div>
  }

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

      {/* Sprint */}
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

      {/* Tasks chart */}
      <Section title="Tareas terminadas por miembro">
        <GenericBarChart
          data={tasksChartData}
          title="Tareas completadas por integrante"
          description="Comparación de desempeño por desarrollador"
          xAxisLabel="Número de tareas completadas"
          valueLabel="Tareas completadas"
        />
      </Section>

      {/* Hours chart */}
      {activeSprint && (
        <Section title="Horas trabajadas por miembro">
          <GenericBarChart
            data={hours.map(u => ({
              label: usersMap.get(u.userId) ?? `User ${u.userId}`,
              value: u.actualHours
            }))}
            title="Horas reales por integrante"
            description="Horas registradas en el sprint actual"
            xAxisLabel="Horas trabajadas"
            valueLabel="Horas"
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