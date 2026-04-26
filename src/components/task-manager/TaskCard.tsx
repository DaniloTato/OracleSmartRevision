import { useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { TaskCardProps } from './types.ts'
import {
   TYPE_LABELS,
   STATUS_OPTIONS,
} from './taskCard.config'

export function TaskCard({
   task,
   onUpdateStatus,
   onDelete,
   isHighlighted,
}: TaskCardProps) {
   const cardRef = useRef<HTMLDivElement>(null)

   const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id: task.id, data: { task } })

   useEffect(() => {
      if (isHighlighted) {
         cardRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
         })
      }
   }, [isHighlighted])

   const style = transform
      ? { transform: CSS.Translate.toString(transform) }
      : undefined

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
        ${isDragging ? 'opacity-50 shadow-md' : ''}
        ${
           isHighlighted
              ? 'ring-2 border-[var(--color-primary)] ring-[var(--color-primary)]'
              : 'border-[var(--color-border)]'
        }
      `}
      >
         {/* Title */}
         <div className="flex justify-between gap-1">
            <p className="text-sm font-medium truncate">{task.title}</p>
         </div>

         {/* Meta */}
         <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span>{typeLabel}</span>

            {task.estimatedHours != null && (
               <span>Est: {task.estimatedHours}</span>
            )}

            {task.actualHours != null && (
               <span>Real: {task.actualHours}</span>
            )}
         </div>

         {/* Actions */}
         <div className="mt-2 flex justify-between items-center">
            {onUpdateStatus ? (
               <select
                  value={task.status}
                  onChange={(e) =>
                     onUpdateStatus(task.id, e.target.value as any)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="text-xs border rounded px-2 py-1
              bg-[var(--color-surface)]
              border-[var(--color-border)]
            "
               >
                  {STATUS_OPTIONS.map((opt) => (
                     <option key={opt.value} value={opt.value}>
                        {opt.label}
                     </option>
                  ))}
               </select>
            ) : (
               <span className="text-xs text-[var(--color-text-muted)]">
                  {STATUS_OPTIONS.find((o) => o.value === task.status)?.label}
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
