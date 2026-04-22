import { Card } from './Card'

export function KpiCard({
   title,
   value,
   subtitle,
   icon: Icon,
   color = 'data-1',
}: {
   title: string
   value: number
   subtitle: string
   icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
   color?: 'data-1' | 'data-2' | 'data-3' | 'data-4'
}) {
   const colorMap = {
      'data-1': {
         text: 'text-[var(--color-data-1)]',
         bg: 'bg-data-1/10',
      },
      'data-2': {
         text: 'text-[var(--color-data-2)]',
         bg: 'bg-data-2/10',
      },
      'data-3': {
         text: 'text-[var(--color-data-3)]',
         bg: 'bg-data-3/10',
      },
      'data-4': {
         text: 'text-[var(--color-data-4)]',
         bg: 'bg-data-4/10',
      },
   }

   const styles = colorMap[color]

   return (
      <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-md transition-shadow">
         <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
               <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  {title}
               </p>

               <p className={`mt-1 text-2xl font-bold ${styles.text}`}>
                  {value}
               </p>

               <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {subtitle}
               </p>
            </div>

            <div
               className={`flex items-center justify-center w-10 h-10 rounded-lg ${styles.bg} ${styles.text} shrink-0`}
            >
               <Icon className="w-5 h-5" aria-hidden />
            </div>
         </div>
      </Card>
   )
}
