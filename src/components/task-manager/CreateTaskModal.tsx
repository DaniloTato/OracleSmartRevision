/**
 * Modal to create a new task. Submitting adds to pool or to a person if "Asignar a" is set.
 */

import { useState } from 'react'
import type { CreateTaskDto, TaskType } from '../../types/Task'
import type { Sprint, Member } from '../../types'
import { useSprint } from '../../context/SprintContext'
import type { Feature } from '../../types'
import { getFeaturesBySprint } from '../../api/taskManagerApi'
import { useEffect } from 'react'

interface CreateTaskModalProps {
    sprints: Sprint[]
    members: Member[]
    onClose: () => void
    onSubmit: (task: CreateTaskDto) => void
}

const TIPO_OPTIONS: TaskType[] = ['TASK', 'BUG', 'TRAINING']
const TIPO_LABELS: Record<TaskType, string> = {
    TASK: 'TASK',
    BUG: 'BUG',
    TRAINING: 'CAPACITACIÓN',
}

export function CreateTaskModal({
    members,
    onClose,
    onSubmit,
}: CreateTaskModalProps) {
    const { selectedSprintId } = useSprint()

    const [features, setFeatures] = useState<Feature[]>([])
    const [featureId, setFeatureId] = useState<number | null>(null)

    const [title, setTitle] = useState('')
    const [tipo, setTipo] = useState<TaskType>('TASK')
    const [estimatedHours, setEstimatedHours] = useState<number>(4)
    const [assigneeId, setAssigneeId] = useState<number | null>(null)

    const hasNoFeatures = features.length === 0

    useEffect(() => {
        async function fetchFeatures() {
            if (!selectedSprintId) return
            try {
                const data = await getFeaturesBySprint(selectedSprintId)
                setFeatures(data)
                // auto-select first feature
                if (data.length > 0) {
                    setFeatureId(data[0].id)
                }
            } catch (err) {
                console.error('Error fetching features', err)
            }
        }

        fetchFeatures()
    }, [selectedSprintId])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !featureId) return
        onSubmit({
            title: title.trim(),
            description: '',
            status: 'open',
            type: tipo,
            assigneeId,
            estimatedHours: estimatedHours || 0,
            actualHours: 0,
            isVisible: true,
            featureId,
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
                            Feature *
                        </label>
                        <select
                            value={featureId ?? ''}
                            onChange={(e) =>
                                setFeatureId(Number(e.target.value))
                            }
                            disabled={hasNoFeatures}
                            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            {hasNoFeatures ? (
                                <option value="">
                                    No hay features disponibles
                                </option>
                            ) : (
                                features.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.title}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Tipo
                        </label>
                        <select
                            value={tipo}
                            onChange={(e) =>
                                setTipo(e.target.value as TaskType)
                            }
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
                            Estimado (horas)
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            value={estimatedHours}
                            onChange={(e) =>
                                setEstimatedHours(Number(e.target.value) || 0)
                            }
                            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Asignar a (opcional)
                        </label>
                        <select
                            value={assigneeId ?? ''}
                            onChange={(e) =>
                                setAssigneeId(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null
                                )
                            }
                            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)]"
                        >
                            <option value="">
                                — Sin asignar (ir a bolsa) —
                            </option>
                            {members.map((member) => (
                                <option
                                    key={member.userId}
                                    value={member.userId}
                                >
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
