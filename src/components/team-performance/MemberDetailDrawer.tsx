/**
 * Right-side drawer for team member detail: Resumen, Fortalezas (IA), Historial, Productividad tabs.
 */

import { useState } from 'react'
import type { MemberDetail } from '../../utils/teamPerformance'
import type { Task } from '../../types'
import { getProductivityByUserId } from '../../mock/productivity'
import { ProductivityChart } from '../charts/ProductivityChart'

type TabId = 'resumen' | 'fortalezas' | 'historial' | 'productividad'

const TABS: { id: TabId; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'fortalezas', label: 'Fortalezas (IA)' },
  { id: 'historial', label: 'Historial' },
  { id: 'productividad', label: 'Productividad' },
]

interface MemberDetailDrawerProps {
  detail: MemberDetail | null
  onClose: () => void
}

export function MemberDetailDrawer({ detail, onClose }: MemberDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('resumen')

  if (!detail) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white shadow-xl flex flex-col border-l border-[var(--color-border)]"
        aria-label={`Detalle de ${detail.userName}`}
      >
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {detail.userName}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">{detail.role}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--color-text-muted)] hover:bg-gray-100 hover:text-[var(--color-text)]"
            aria-label="Cerrar"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="border-b border-[var(--color-border)] flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--color-oracle-orange)] border-b-2 border-[var(--color-oracle-orange)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'resumen' && (
            <ResumenTab detail={detail} />
          )}
          {activeTab === 'fortalezas' && (
            <FortalezasTab strengths={detail.strengths} />
          )}
          {activeTab === 'historial' && (
            <HistorialTab sprintHistory={detail.sprintHistory} />
          )}
          {activeTab === 'productividad' && (
            <ProductividadTab userId={detail.userId} />
          )}
        </div>
      </aside>
    </>
  )
}

function ResumenTab({ detail }: { detail: MemberDetail }) {
  const { kpis, lastTasks } = detail
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">KPIs</h3>
        <div className="grid grid-cols-2 gap-3">
          <KpiBox label="Tareas activas" value={kpis.tareasActivas} />
          <KpiBox label="Completadas (sprint actual)" value={kpis.completadasSprintActual} />
          <KpiBox label="Promedio variación (h)" value={kpis.promedioVariacion} />
          <KpiBox label="Score productividad" value={kpis.scoreProductividad} suffix="%" />
          <KpiBox label="Tendencia" value={kpis.tendencia === 'up' ? '↑' : '↓'} />
          <KpiBox label="Carga (h estimadas)" value={kpis.cargaHoras} />
        </div>
      </section>
      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Últimas tareas</h3>
        {lastTasks.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Sin tareas recientes.</p>
        ) : (
          <ul className="space-y-2">
            {lastTasks.map((t) => (
              <TaskLineItem key={t.id} task={t} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function KpiBox({
  label,
  value,
  suffix = '',
}: {
  label: string
  value: number | string
  suffix?: string
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] p-3">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="text-lg font-semibold text-[var(--color-text)]">
        {value}
        {suffix}
      </p>
    </div>
  )
}

function TaskLineItem({ task }: { task: Task }) {
  const statusLabel =
    task.status === 'completada'
      ? 'Hecho'
      : task.status === 'en_progreso'
        ? 'En proceso'
        : task.status === 'revisión'
          ? 'Revisión'
          : 'To Do'
  return (
    <li className="flex items-center justify-between gap-2 text-sm rounded border border-[var(--color-border)] p-2 bg-white">
      <span className="font-medium text-[var(--color-text)] truncate">{task.title}</span>
      <span className="text-xs text-[var(--color-text-muted)] shrink-0">
        {statusLabel}
        {task.estimatedHours != null && ` · ${task.estimatedHours}h`}
      </span>
    </li>
  )
}

function FortalezasTab({ strengths }: { strengths: string[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">
        Insights simulados (mock) a partir del historial de tareas.
      </p>
      <ul className="space-y-3">
        {strengths.map((s, i) => (
          <li
            key={i}
            className="flex gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] p-3 text-sm text-[var(--color-text)]"
          >
            <span className="text-[var(--color-oracle-orange)] shrink-0">•</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}

function HistorialTab({
  sprintHistory,
}: {
  sprintHistory: MemberDetail['sprintHistory']
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">
        Resumen por sprint (datos mock).
      </p>
      <ul className="space-y-2">
        {sprintHistory.map((s) => (
          <li
            key={s.sprintId}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] p-3 text-sm"
          >
            <span className="font-medium text-[var(--color-text)]">{s.sprintName}</span>
            <span className="text-[var(--color-text-muted)]">
              {s.completed} / {s.total} tareas
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Productividad tab: same line chart as dashboard for this employee. */
function ProductividadTab({ userId }: { userId: string }) {
  const data = getProductivityByUserId(userId)?.points ?? []
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">
        Medición de la productividad: Antes (línea base) vs Después (actual).
      </p>
      <ProductivityChart data={data} height={280} />
    </div>
  )
}
