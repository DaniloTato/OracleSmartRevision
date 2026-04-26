import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid,
   ResponsiveContainer,
   Legend,
} from 'recharts'

interface MultiBarChartProps {
   data: any[]
   keys: string[]
   colors?: string[]
   xKey: string
   title: string
   description: string
}

const DEFAULT_COLORS = [
   'var(--color-data-1)',
   'var(--color-data-2)',
   'var(--color-data-3)',
   'var(--color-data-4)',
   'var(--color-data-5)',
]

export function MultiBarChart({
   data,
   keys,
   xKey,
   title,
   description,
   colors = DEFAULT_COLORS,
}: MultiBarChartProps) {
   if (!data.length) {
      return <div className="p-4 text-sm text-gray-400">No data</div>
   }

   return (
      <div className="rounded-xl bg-[var(--color-surface)] p-4 border border-[var(--color-border)]">
         <div className="mb-3">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
               {description}
            </p>
         </div>

         <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  
                  <XAxis dataKey={xKey} />
                  <YAxis allowDecimals={false} />

                  <Tooltip />
                  <Legend />

                  {keys.map((key, i) => (
                     <Bar
                        key={key}
                        dataKey={key}
                        fill={colors[i % colors.length]}
                        radius={[4, 4, 0, 0]}
                     />
                  ))}
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
   )
}