/**
 * Left panel: "Bolsa de Tareas" with filters and unassigned task cards.
 * Droppable area so tasks can be dragged here to unassign.
 */

import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus, TaskType, TaskPriority } from '../../types'
import type { Sprint } from '../../types'

const TIPO_OPTIONS: { value: '' | TaskType; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'issue', label: 'Issue' },
  { value: 'capacitación', label: 'Capacitación' },
]

const PRIORIDAD_OPTIONS: { value: '' | TaskPriority; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

const ESTADO_OPTIONS: { value: '' | TaskStatus; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'To Do' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'closed', label: 'Hecho' },
]

interface TaskPoolProps {
  tasks: Task[]
  sprints: Sprint[]
  filters: {
    tipo: '' | TaskType
    prioridad: '' | TaskPriority
    estado: '' | TaskStatus
    sprintId: string
  }
  onFiltersChange: (f: TaskPoolProps['filters']) => void
  onUpdateStatus: (taskId: number, status: TaskStatus) => void
  poolId: string
  taskIdsAssignedViaAI: Set<number>
  /** When set, the matching task card is visually highlighted (from deep link ?taskId=) */
  highlightedTaskId?: number
}

export function TaskPool({
  tasks,
  sprints,
  filters,
  onFiltersChange,
  onUpdateStatus,
  poolId,
  taskIdsAssignedViaAI,
  highlightedTaskId = undefined,
}: TaskPoolProps) {
  const { setNodeRef, isOver } = useDroppable({ id: poolId })

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] overflow-hidden min-h-[320px] flex-1">
      <div className="p-4 border-b border-[var(--color-border)] shrink-0">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-3">
          Bolsa de Tareas
        </h2>
        <div className="grid grid-cols-2 gap-2 min-w-0">
          <FilterSelect
            label="Tipo"
            value={filters.tipo}
            options={TIPO_OPTIONS}
            onChange={(tipo) => onFiltersChange({ ...filters, tipo: tipo as '' | TaskType })}
          />
          <FilterSelect
            label="Prioridad"
            value={filters.prioridad}
            options={PRIORIDAD_OPTIONS}
            onChange={(prioridad) => onFiltersChange({ ...filters, prioridad: prioridad as '' | TaskPriority })}
          />
          <FilterSelect
            label="Estado"
            value={filters.estado}
            options={ESTADO_OPTIONS}
            onChange={(estado) => onFiltersChange({ ...filters, estado: estado as '' | TaskStatus })}
          />
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-0.5">
              Sprint
            </label>
            <select
              value={filters.sprintId}
              onChange={(e) => onFiltersChange({ ...filters, sprintId: e.target.value })}
              className="w-full rounded border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-oracle-orange)]"
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0 transition-colors ${
          isOver ? 'bg-orange-50' : ''
        }`}
      >
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
              No hay tareas sin asignar con estos filtros.
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateStatus}
                isAssignedViaAI={taskIdsAssignedViaAI.has(task.id)}
                isHighlighted={task.id === highlightedTaskId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-0.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-oracle-orange)]"
      >
        {options.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
