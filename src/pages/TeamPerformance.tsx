/**
 * Team Performance page: table of members with metrics and "Ver detalle" opening a drawer.
 * All data from mock tasks via utils/teamPerformance.
 */

//STILL NEEDS TO BE REFACTORED

import { useState, useMemo } from 'react'
import { HiOutlineChartPie } from 'react-icons/hi'
import {
  getMemberDetail,
  getTaskStatusDistributionForMember,
} from '../mock/teamPerformance'
import { MemberDetailDrawer } from '../components/team-performance/MemberDetailDrawer'
import { TaskStatusPieChart } from '../components/charts/TaskStatusPieChart'
import { useSprint } from '../context/SprintContext'
import { mockUsers } from '../mock/users'
import { getSprintById } from '../mock/sprints'

export function TeamPerformance() {
  const { selectedSprintId } = useSprint()
  const sprint = getSprintById(selectedSprintId)
  const integrantes = useMemo(
    () => mockUsers.filter((u) => u.role !== 'Administrador'),
    []
  )
  const [pieMemberId, setPieMemberId] = useState(integrantes[0]?.id ?? undefined)
  const memberDistribution = useMemo(
    () =>
      sprint && pieMemberId
        ? getTaskStatusDistributionForMember(selectedSprintId, pieMemberId)
        : [],
    [sprint, selectedSprintId, pieMemberId]
  )
  const selectedMemberName =
    integrantes.find((u) => u.id === pieMemberId)?.name ?? 'Integrante'

  const [detailUserId, setDetailUserId] = useState<number | null>(null)
  const detail = detailUserId ? getMemberDetail(detailUserId) : null

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--color-border)] bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex items-start gap-2">
            <HiOutlineChartPie className="w-5 h-5 text-[var(--color-oracle-orange)] shrink-0 mt-0.5" aria-hidden />
            <div>
              <h2 className="text-lg font-medium text-[var(--color-text)]">
                Distribución de tareas por integrante
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {sprint
                  ? `${sprint.name}: estados de las tareas asignadas a la persona seleccionada.`
                  : 'Selecciona un sprint en la cabecera.'}
              </p>
            </div>
          </div>
          {sprint && integrantes.length > 0 && (
            <div className="flex flex-col gap-1.5 sm:min-w-[220px]">
              <label
                htmlFor="team-perf-member-pie"
                className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide"
              >
                Integrante
              </label>
              <select
                id="team-perf-member-pie"
                value={pieMemberId}
                onChange={(e) => setPieMemberId(Number(e.target.value))}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
              >
                {integrantes.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {sprint && (
          <div className="mt-6">
            <p className="text-sm font-medium text-[var(--color-text)] mb-3">
              {selectedMemberName}
            </p>
            <TaskStatusPieChart
              data={memberDistribution}
              height={300}
              emptyMessage={`${selectedMemberName} no tiene tareas asignadas en este sprint.`}
              totalDescriptor="asignadas a este integrante en el sprint"
            />
          </div>
        )}
      </section>

      {detail && (
        <MemberDetailDrawer
          detail={detail}
          onClose={() => setDetailUserId(null)}
        />
      )}
    </div>
  )
}
