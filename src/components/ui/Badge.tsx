import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger'

const variants: Record<BadgeVariant, string> = {
   default: 'bg-gray-100 text-gray-800',
   success: 'bg-green-100 text-green-800',
   warning: 'bg-amber-100 text-amber-900',
   danger: 'bg-red-100 text-red-800',
}

export function Badge({
   children,
   variant = 'default',
}: {
   children: ReactNode
   variant?: BadgeVariant
}) {
   return (
      <span
         className={`rounded px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
      >
         {children}
      </span>
   )
}
