export function ChartPlaceholder({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)] h-40 text-sm text-[var(--color-text-muted)]">
            {message}
        </div>
    )
}
