import {
  HiOutlineViewGrid,
  HiOutlineTrendingUp,
  HiOutlineCheckCircle,
  HiOutlinePlay,
  HiOutlineClipboardList,
} from 'react-icons/hi'

import { HiOutlineChartBar } from 'react-icons/hi'

import {
  getSprintById,
  mockSprints
} from '../mock'

import {
  getSprintProgressPercent,
  getCompletedTasksCount,
  getTasksInProgressCount,
  getTasksToDoCount,
  getEstimatedVsRealByPerson,
  getDistributionByType,
  getCompletedTasksByMember,
} from '../utils/dashboard'

import { useSprint } from '../context/SprintContext'
import { GenericBarChart } from '../components/charts/GenericBarChart'

import { useState, useMemo } from 'react'

import { Section } from '../components/ui/Section'
import { KpiCard } from '../components/ui/KpiCard'
import { Table, THead, TRow, TH, TD } from '../components/ui/Table'
import { DistributionBar } from '../components/ui/DistributionBar'
import { ChartPlaceholder } from '../components/ui/ChartPlaceholder'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'

export function Dashboard() {
  const { selectedSprintId } = useSprint()
  const activeSprint = getSprintById(selectedSprintId)
  const sprintId = selectedSprintId

  const progressPercent = getSprintProgressPercent(sprintId)
  const completedCount = getCompletedTasksCount(sprintId)
  const inProgressCount = getTasksInProgressCount(sprintId)
  const toDoCount = getTasksToDoCount(sprintId)

  const estimatedVsRealRows = getEstimatedVsRealByPerson(sprintId)
  const distribution = getDistributionByType(sprintId)

  const [tasksSprintId, setTasksSprintId] = useState(selectedSprintId)

  const totalDistributionValue = distribution.feature + distribution.bug + distribution.issue + distribution.capacitación;

  const tasksChartData = useMemo(() => {
    const data = getCompletedTasksByMember(tasksSprintId)

    return data.map(u => ({
      label: u.userName,
      value: u.completadas,
    }))
  }, [tasksSprintId])

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
          title="Progreso del Sprint (%)"
          value={progressPercent}
          subtitle="Sprint actual"
          icon={HiOutlineTrendingUp}
          color="data-1"
        />

        <KpiCard
          title="Tareas Completadas"
          value={completedCount}
          subtitle="Sprint actual"
          icon={HiOutlineCheckCircle}
          color="data-2"
        />

        <KpiCard
          title="En Proceso"
          value={inProgressCount}
          subtitle="Sprint actual"
          icon={HiOutlinePlay}
          color="data-3"
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
        
        {/* Sprint selector */}
        <div className="mb-4">
          <Label>Sprint</Label>
          <Select
            value={tasksSprintId}
            onChange={(e) => setTasksSprintId(Number(e.target.value))}
          >
            {mockSprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

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
              label: u.userName,
              value: u.actualHours
            }))}
            title="Horas reales por integrante"
            description="Cantidad de horas registradas en el sprint actual"
            xAxisLabel="Horas reales trabajadas"
            valueLabel="Horas reales trabajadas"
          />
        </Section>
      )}

      {/* Table */}
      <Section
        title="Estimado vs Real por Persona"
        icon={HiOutlineChartBar}
      >
        {estimatedVsRealRows.length === 0 ? (
          <ChartPlaceholder message="No hay datos de estimado/real para el sprint." />
        ) : (
          <Table>
            <THead>
              <TRow>
                <TH>Persona</TH>
                <TH>Estimado (h)</TH>
                <TH>Real (h)</TH>
              </TRow>
            </THead>

            <tbody>
              {estimatedVsRealRows.map((row) => (
                <TRow key={row.userId}>
                  <TD>{row.userName}</TD>
                  <TD>{row.estimatedHours}</TD>
                  <TD>{row.actualHours}</TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      {/* Distribución */}
      <Section title="Distribución por Tipo">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DistributionBar
            label="Feature"
            count={distribution.feature}
            total={totalDistributionValue}
            color="bg-data-1"
          />

          <DistributionBar
            label="Bug"
            count={distribution.bug}
            total={totalDistributionValue}
            color="bg-data-2"
          />

          <DistributionBar
            label="Issue"
            count={distribution.issue}
            total={totalDistributionValue}
            color="bg-data-3"
          />

          <DistributionBar
            label="Capacitación"
            count={distribution.capacitación}
            total={totalDistributionValue}
            color="bg-data-4"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
          Total: {distribution.feature + distribution.bug + distribution.issue + distribution.capacitación} tareas
        </div>
      </Section>
    </div>
  )
}

/* ===== helpers ===== */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES')
}