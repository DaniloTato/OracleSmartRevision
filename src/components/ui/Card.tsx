import type { ReactNode, HTMLAttributes } from "react"

type CardProps = {
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="p-6">{children}</div>
}