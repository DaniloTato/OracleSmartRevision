import type { ReactNode, ButtonHTMLAttributes } from "react"

type Variant = "primary" | "secondary" | "outline" | "ghost"

type ButtonProps = {
  children: ReactNode
  variant?: Variant
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-medium transition-colors"

  const variants: Record<Variant, string> = {
    primary: `
      bg-primary text-white 
      hover:bg-primary-light
    `,

    secondary: `
      bg-white 
      text-[var(--color-text)] 
      border border-[var(--color-border)] 
      hover:bg-gray-100
    `,

    outline: `
      border border-primary 
      text-primary 
      hover:bg-primary/10
    `,

    ghost: `
      text-[var(--color-text-muted)] 
      hover:bg-gray-100
    `,
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}