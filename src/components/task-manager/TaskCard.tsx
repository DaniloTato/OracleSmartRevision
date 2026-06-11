import { useRef, useEffect, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { TaskCardProps } from './types.ts'
import { TYPE_LABELS, STATUS_OPTIONS } from './taskCard.config'

interface ExtendedTaskCardProps extends TaskCardProps {
    isLate?: boolean
    isSemanticMatch?: boolean
    isBestMatch?: boolean
}

export function TaskCard({
    task,
    onUpdateStatus,
    onDelete,
    isLate = false,
    isSemanticMatch = false,
    isBestMatch = false,
}: ExtendedTaskCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)

    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: task.id, data: { task } })

    const late = isLate && task.status !== 'closed'
    const semantic = isSemanticMatch
    const best = isBestMatch

    useEffect(() => {
        if (best) {
            cardRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }
    }, [best])

    const style = useMemo(() => {
        const base = transform
            ? { transform: CSS.Translate.toString(transform) }
            : {}

        const semanticStyle =
            semantic && !best && !late
                ? {
                      backgroundColor: 'rgba(59, 130, 246, 0.04)', // más tenue
                      boxShadow: '0 0 0 1px rgba(59,130,246,0.08)', // más sutil
                  }
                : {}

        return { ...base, ...semanticStyle }
    }, [transform, semantic, best, late])

    const typeLabel = TYPE_LABELS[task.type] ?? 'Feature'

    return (
        <div
            ref={(node) => {
                cardRef.current = node
                setNodeRef(node)
            }}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                rounded-lg border p-3 shadow-sm text-left
                bg-[var(--color-surface)]
                text-[var(--color-text)]
                cursor-grab active:cursor-grabbing touch-none
                transition-all duration-200

                ${isDragging ? 'opacity-50 shadow-md' : ''}

                /* =========================
                   BORDER PRIORITY
                ========================== */
                ${
                    late
                        ? 'border-[var(--color-danger)]'
                        : best
                          ? 'border-blue-500'
                          : semantic
                            ? 'border-blue-400/60'
                            : 'border-[var(--color-border)]'
                }

                /* =========================
                   RING LAYER
                ========================== */
                ${semantic ? 'ring-2 ring-blue-400/30' : ''}
                ${best ? 'ring-4 ring-blue-500/40 scale-[1.02]' : ''}

                /* =========================
                   BACKGROUND PRIORITY
                ========================== */
                ${late ? 'bg-[rgba(220,38,38,0.05)]' : best ? 'bg-blue-300/60' : ''}
            `}
        >
            {/* HEADER */}
            <div className="flex justify-between items-center gap-2">
                <p className="text-sm font-medium truncate">{task.title}</p>

                {late && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                        Late
                    </span>
                )}

                {best && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                        Best
                    </span>
                )}

                {semantic && !best && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                        Match
                    </span>
                )}
            </div>

            {/* META */}
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-[var(--color-text-muted)]">
                <span>{typeLabel}</span>

                {task.estimatedHours != null && (
                    <span>Est: {task.estimatedHours}</span>
                )}

                {task.actualHours != null && (
                    <span>Real: {task.actualHours}</span>
                )}

                {task.dueDate && (
                    <span>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* ACTIONS */}
            <div className="mt-2 flex justify-between items-center">
                {onUpdateStatus ? (
                    <select
                        value={task.status}
                        onChange={(e) =>
                            onUpdateStatus(task.id, e.target.value as any)
                        }
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="text-xs border rounded px-2 py-1 bg-[var(--color-surface)] border-[var(--color-border)]"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {
                            STATUS_OPTIONS.find((o) => o.value === task.status)
                                ?.label
                        }
                    </span>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(task.id)
                    }}
                    className="text-xs text-[var(--color-danger)] hover:opacity-80"
                >
                    🗑
                </button>
            </div>
        </div>
    )
}
