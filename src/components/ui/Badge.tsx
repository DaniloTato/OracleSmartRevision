import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variants: Record<BadgeVariant, string> = {
    default: 'bg-badge-default text-badge-default',
    success: 'bg-badge-success text-badge-success',
    warning: 'bg-badge-warning text-badge-warning',
    danger: 'bg-badge-danger text-badge-danger',
    info: 'bg-badge-info text-badge-info',
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
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
        >
            {children}
        </span>
    )
}