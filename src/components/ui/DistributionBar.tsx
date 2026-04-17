export function DistributionBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="min-w-0">
      <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{count} tareas</p>

      <div className="mt-2 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}