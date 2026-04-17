/**
 * Draggable task card used in both pool and team columns.
 * Shows title, type, priority, estimated h, status; optional status dropdown.
 */

import { useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskStatus, TaskPriority } from '../../types'

const TYPE_LABELS: Record<string, string> = {
  feature: 'Feature',
  bug: 'Bug',
  issue: 'Issue',
  capacitación: 'Capacitación',
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pendiente', label: 'To Do' },
  { value: 'en_progreso', label: 'En Proceso' },
  { value: 'completada', label: 'Hecho' },
]

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  baja: 'bg-gray-100 text-gray-700',
  media: 'bg-amber-100 text-amber-800',
  alta: 'bg-red-100 text-red-800',
}

interface TaskCardProps {
  task: Task
  onUpdateStatus?: (taskId: number, status: TaskStatus) => void
  /** When true, show small "IA" badge (task was assigned via AI recommendation) */
  isAssignedViaAI?: boolean
  /** When true, highlight card (e.g. from deep link ?taskId=) and scroll into view */
  isHighlighted?: boolean
}

export function TaskCard({ task, onUpdateStatus, isAssignedViaAI, isHighlighted }: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task.id, data: { task } })

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isHighlighted])

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const typeLabel = (task.type && TYPE_LABELS[task.type]) || 'Feature'

  return (
    <div
      ref={(node) => {
        cardRef.current = node
        setNodeRef(node)
      }}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border bg-white p-3 shadow-sm text-left cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? 'opacity-50 shadow-md' : ''
      } ${
        isHighlighted
          ? 'ring-2 ring-[var(--color-oracle-orange)] border-[var(--color-oracle-orange)]'
          : 'border-[var(--color-border)]'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="font-medium text-sm text-[var(--color-text)] leading-tight flex-1 min-w-0">
          {task.title}
        </p>
        {isAssignedViaAI && (
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-violet-100 text-violet-700"
            title="Asignada por recomendación IA"
          >
            IA
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-[var(--color-text-muted)]">{typeLabel}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLE[task.priority] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {task.priority}
        </span>
        {task.estimatedHours != null && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {task.estimatedHours}h
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {onUpdateStatus ? (
          <select
            value={task.status}
            onChange={(e) =>
              onUpdateStatus(task.id, e.target.value as TaskStatus)
            }
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-xs rounded border border-[var(--color-border)] bg-white px-2 py-1 text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-oracle-orange)]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">
            {STATUS_OPTIONS.find((o) => o.value === task.status)?.label ?? task.status}
          </span>
        )}
      </div>
    </div>
  )
}
