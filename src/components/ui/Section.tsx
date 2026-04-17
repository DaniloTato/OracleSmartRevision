import type { ReactNode } from "react"

export function Section({
  title,
  icon: Icon,
  children,
}: {
  title?: string
  icon?: React.ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && (
            <Icon className="w-5 h-5 text-[var(--color-oracle-orange)]" />
          )}
          <h2 className="text-lg font-medium text-[var(--color-text)]">
            {title}
          </h2>
        </div>
      )}
      {children}
    </section>
  )
}