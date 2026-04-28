import type { ReactNode } from 'react'

export function Label({ children }: { children: ReactNode }) {
    return (
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
            {children}
        </label>
    )
}
