/**
 * Modal to create a new task. Submitting adds to pool or to a person if "Asignar a" is set.
 */

import { useState } from 'react'
import type { Task, TaskType, TaskPriority } from '../../types'
import type { Sprint, Member } from '../../types'

interface CreateTaskModalProps {
  sprints: Sprint[]
  members: Member[]
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void
}

const TIPO_OPTIONS: TaskType[] = ['TASK', 'BUG', 'TRAINING']
const TIPO_LABELS: Record<TaskType, string> = {
  TASK: 'TASK',
  BUG: 'BUG',
  TRAINING: 'CAPACITACIÓN',
}
const PRIORIDAD_OPTIONS: TaskPriority[] = ['alta', 'media', 'baja']

export function CreateTaskModal({
  sprints,
  members,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [tipo, setTipo] = useState<TaskType>('TASK')
  const [prioridad, setPrioridad] = useState<TaskPriority>('media')
  const [sprintId, setSprintId] = useState(sprints[0]?.id ?? '')
  const [estimatedHours, setEstimatedHours] = useState<number>(4)
  const [assigneeId, setAssigneeId] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    onSubmit({
      title: title.trim(),
      description: '',
      status: 'open',
      priority: prioridad,
      type: tipo,
      assigneeId: assigneeId,
      sprintId: sprintId || (sprints[0]?.id ?? ''),
      estimatedHours: estimatedHours || 0,
      actualHours: 0,
      isVisible: true,
      featureId: 1
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Crear Tarea
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
              placeholder="Ej: Implementar exportación CSV"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TaskType)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
            >
              {TIPO_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Prioridad
            </label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as TaskPriority)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
            >
              {PRIORIDAD_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Sprint
            </label>
            <select
              value={sprintId}
              onChange={(e) => setSprintId(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Estimado (horas)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Asignar a (opcional)
            </label>
            <select
              value={assigneeId ?? ''}
              onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
            >
              <option value="">— Sin asignar (ir a bolsa) —</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
