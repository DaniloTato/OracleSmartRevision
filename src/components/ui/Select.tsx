import type { SelectHTMLAttributes } from 'react'

type Option = {
    value: string | number
    label: string
}

type DashboardSelectProps = {
    value: string | number
    onChange: (value: string) => void
    options: Option[]
    className?: string
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>

export function Select({
    value,
    onChange,
    options,
    className = '',
    ...props
}: DashboardSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`rounded-lg border border-default px-3 py-2 ${className}`}
            {...props}
        >
            {options.map((option) => (
                <option key={String(option.value)} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}
