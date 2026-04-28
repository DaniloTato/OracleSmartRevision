import type { SelectHTMLAttributes } from 'react'

export function Select({
    className = '',
    ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={`rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-oracle-orange)] ${className}`}
            {...props}
        />
    )
}
