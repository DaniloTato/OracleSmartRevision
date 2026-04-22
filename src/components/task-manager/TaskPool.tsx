import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import type {
   Task,
   TaskStatus,
   TaskType,
   TaskPriority,
   Sprint,
} from '../../types'
import type { Filters, Option } from './types'

/* =========================
   TYPES
========================= */

interface TaskPoolProps {
   tasks: Task[]
   sprints: Sprint[]
   filters: Filters
   onFiltersChange: (f: Filters) => void
   onUpdateStatus: (taskId: number, status: TaskStatus) => void
   onDeleteTask: (taskId: number) => void
   poolId: string
   highlightedTaskId?: number
}

/* =========================
   CONSTANTS
========================= */

const TIPO_OPTIONS: Option<'' | TaskType>[] = [
   { value: '', label: 'Todos' },
   { value: 'TASK', label: 'Feature' },
   { value: 'BUG', label: 'Bug' },
   { value: 'TRAINING', label: 'Capacitación' },
]

const PRIORIDAD_OPTIONS: Option<'' | TaskPriority>[] = [
   { value: '', label: 'Todas' },
   { value: 'alta', label: 'Alta' },
   { value: 'media', label: 'Media' },
   { value: 'baja', label: 'Baja' },
]

const ESTADO_OPTIONS: Option<'' | TaskStatus>[] = [
   { value: '', label: 'Todos' },
   { value: 'open', label: 'To Do' },
   { value: 'in_progress', label: 'En Proceso' },
   { value: 'closed', label: 'Hecho' },
]

/* =========================
   COMPONENT
========================= */

export function TaskPool({
   tasks,
   sprints,
   filters,
   onFiltersChange,
   onUpdateStatus,
   onDeleteTask,
   poolId,
   highlightedTaskId,
}: TaskPoolProps) {
   const { setNodeRef, isOver } = useDroppable({ id: poolId })

   /* ---------- Handlers ---------- */

   const updateFilter = <K extends keyof Filters>(
      key: K,
      value: Filters[K]
   ) => {
      onFiltersChange({ ...filters, [key]: value })
   }

   /* ---------- Render ---------- */

   return (
      <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] overflow-hidden min-h-[320px] flex-1">
         {/* HEADER */}
         <div className="p-4 border-b border-[var(--color-border)] shrink-0">
            <h2 className="text-lg font-medium text-[var(--color-text)] mb-3">
               Sprint Backlog
            </h2>

            <div className="grid grid-cols-2 gap-2">
               <FilterSelect
                  label="Tipo"
                  value={filters.tipo}
                  options={TIPO_OPTIONS}
                  onChange={(v) => updateFilter('tipo', v)}
               />

               <FilterSelect
                  label="Prioridad"
                  value={filters.prioridad}
                  options={PRIORIDAD_OPTIONS}
                  onChange={(v) => updateFilter('prioridad', v)}
               />

               <FilterSelect
                  label="Estado"
                  value={filters.estado}
                  options={ESTADO_OPTIONS}
                  onChange={(v) => updateFilter('estado', v)}
               />

               {/* Sprint */}
               <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-0.5">
                     Sprint
                  </label>
                  <select
                     value={filters.sprintId}
                     onChange={(e) => updateFilter('sprintId', e.target.value)}
                     className="w-full rounded border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
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

         {/* TASK LIST */}
         <div
            ref={setNodeRef}
            className={`flex-1 overflow-y-auto p-3 transition-colors ${
               isOver ? 'bg-orange-50' : ''
            }`}
         >
            {tasks.length === 0 ? (
               <EmptyState />
            ) : (
               <div className="space-y-2">
                  {tasks.map((task) => (
                     <TaskCard
                        key={task.id}
                        task={task}
                        onUpdateStatus={onUpdateStatus}
                        onDelete={onDeleteTask}
                        isHighlighted={task.id === highlightedTaskId}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   )
}

/* =========================
   SUBCOMPONENTS
========================= */

function FilterSelect<T extends string>({
   label,
   value,
   options,
   onChange,
}: {
   label: string
   value: T
   options: Option<T>[]
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
            className="w-full rounded border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
         >
            {options.map((opt, i) => (
               <option key={`${opt.value}-${i}`} value={opt.value}>
                  {opt.label}
               </option>
            ))}
         </select>
      </div>
   )
}

function EmptyState() {
   return (
      <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
         No hay tareas sin asignar con estos filtros.
      </p>
   )
}
