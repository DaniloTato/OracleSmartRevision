type Severity = 'low' | 'medium' | 'high'

const severityMap: Record<
    Severity,
    {
        label: string
        className: string
        dot: string
    }
> = {
    low: {
        label: 'Baja',
        className: 'bg-severity-low text-severity-low',
        dot: 'bg-success',
    },
    medium: {
        label: 'Media',
        className: 'bg-severity-medium text-severity-medium',
        dot: 'bg-warning',
    },
    high: {
        label: 'Alta',
        className: 'bg-severity-high text-severity-high',
        dot: 'bg-danger',
    },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
    const s = severityMap[severity]

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border border-default ${s.className}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
            />
            {s.label}
        </span>
    )
}