import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid,
   ResponsiveContainer,
   LabelList,
   Cell,
} from 'recharts'

import { useEffect, useState } from 'react'

interface BarChartDatum {
   label: string
   value: number
}

interface GenericBarChartProps {
   data: BarChartDatum[]
   height?: number

   title: string
   description: string
   xAxisLabel: string

   /* optional */
   valueLabel?: string // for tooltip wording
}

const DATA_COLORS = [
   'var(--color-data-1)',
   'var(--color-data-2)',
   'var(--color-data-3)',
   'var(--color-data-4)',
]

export function GenericBarChart({
   data,
   height = 280,
   title,
   description,
   xAxisLabel,
   valueLabel = 'Valor',
}: GenericBarChartProps) {
   const [mounted, setMounted] = useState(false)

   useEffect(() => {
      const id = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(id)
   }, [])

   if (!mounted) return null

   if (data.length === 0) {
      return (
         <div
            className="flex items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]"
            style={{ height }}
         >
            No hay datos disponibles.
         </div>
      )
   }

   const maxVal = Math.max(1, ...data.map((d) => d.value))

   return (
      <div
         className="rounded-xl bg-[var(--color-surface)] p-4 border border-[var(--color-border)]"
         style={{ minHeight: height }}
      >
         {/* ✅ Context ALWAYS visible */}
         <div className="mb-3">
            <p className="text-sm font-medium text-[var(--color-text)]">
               {title}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
               {description}
            </p>
         </div>

         <div
            className="w-full"
            style={{ height: `${height}px`, minHeight: `${height}px` }}
         >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
               <BarChart
                  layout="vertical"
                  data={data}
                  margin={{ top: 12, right: 40, left: 4, bottom: 20 }}
                  barCategoryGap="18%"
               >
                  <CartesianGrid
                     strokeDasharray="4 6"
                     stroke="var(--color-border)"
                     horizontal={false}
                     vertical
                  />

                  <XAxis
                     type="number"
                     domain={[0, Math.ceil(maxVal * 1.15)]}
                     allowDecimals={false}
                     tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                     tickLine={false}
                     axisLine={{ stroke: 'var(--color-border)' }}
                     label={{
                        value: xAxisLabel,
                        position: 'bottom',
                        offset: 10,
                        style: {
                           fill: 'var(--color-text-muted)',
                           fontSize: 11,
                        },
                     }}
                  />

                  <YAxis
                     type="category"
                     dataKey="label"
                     width={120}
                     tick={{ fontSize: 11, fill: 'var(--color-text)' }}
                     tickLine={false}
                     axisLine={false}
                  />

                  <Tooltip
                     cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }}
                     content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        const v = payload[0]?.value

                        return (
                           <div className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
                              <p className="text-xs text-[var(--color-text-muted)]">
                                 {label}
                              </p>

                              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                 {valueLabel}
                              </p>
                              <p className="text-sm font-semibold text-primary">
                                 {typeof v === 'number' ? v : 0}
                              </p>
                           </div>
                        )
                     }}
                  />

                  <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={28}>
                     {data.map((_, i) => (
                        <Cell
                           key={`cell-${i}`}
                           fill={DATA_COLORS[i % DATA_COLORS.length]}
                        />
                     ))}

                     <LabelList
                        dataKey="value"
                        position="right"
                        fill="var(--color-text)"
                        fontSize={12}
                        fontWeight={600}
                     />
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
   )
}
