import type { ReactNode, HTMLAttributes } from 'react'

export function Table({ children }: { children: ReactNode }) {
   return (
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
         <table className="w-full text-left text-sm">{children}</table>
      </div>
   )
}

export function THead({ children }: { children: ReactNode }) {
   return (
      <thead className="bg-[var(--color-sidebar-bg)] border-b border-[var(--color-border)]">
         {children}
      </thead>
   )
}

export function TRow({
   children,
   className = '',
   ...props
}: { children: ReactNode } & HTMLAttributes<HTMLTableRowElement>) {
   return (
      <tr
         className={`border-b border-[var(--color-border)] hover:bg-gray-50 ${className}`}
         {...props}
      >
         {children}
      </tr>
   )
}

export function TH({
   children,
   className = '',
   ...props
}: { children: ReactNode } & HTMLAttributes<HTMLTableCellElement>) {
   return (
      <th
         className={`px-4 py-3 text-sm font-medium text-[var(--color-text)] ${className}`}
         {...props}
      >
         {children}
      </th>
   )
}

export function TD({
   children,
   className = '',
   ...props
}: { children: ReactNode } & HTMLAttributes<HTMLTableCellElement>) {
   return (
      <td className={`px-4 py-3 ${className}`} {...props}>
         {children}
      </td>
   )
}
