/**
 * Pie chart: task distribution (completed / pending / in progress) for a sprint.
 */

import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import type { TaskStatusSlice } from '../../types/teamPerformance.ts'

interface TaskStatusPieChartProps {
    data: TaskStatusSlice[]
    height?: number
    /** Shown when there are no slices (e.g. integrante sin tareas en el sprint). */
    emptyMessage?: string
    /** Texto tras el conteo, p. ej. "asignadas a este integrante en el sprint". Por defecto: en el sprint. */
    totalDescriptor?: string
}

export function TaskStatusPieChart({
    data,
    height = 300,
    emptyMessage = 'No hay datos para mostrar.',
    totalDescriptor = 'en el sprint',
}: TaskStatusPieChartProps) {
    if (data.length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-slate-50/80 text-sm text-[var(--color-text-muted)] text-center px-4 min-h-[200px]"
                style={{ height }}
            >
                {emptyMessage}
            </div>
        )
    }

    const total = data.reduce((s, d) => s + d.value, 0)

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-gradient-to-b from-white to-slate-50/60 p-2 sm:p-4">
            <div style={{ width: '100%', height }} className="min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                        margin={{ top: 12, right: 12, bottom: 8, left: 12 }}
                    >
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="48%"
                            innerRadius="42%"
                            outerRadius="72%"
                            paddingAngle={2}
                            label={({ name, percent }) =>
                                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                            labelLine={{
                                stroke: 'var(--color-text-muted)',
                                strokeOpacity: 0.6,
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`slice-${entry.name}-${index}`}
                                    fill={entry.fill}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-sidebar-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            formatter={(value: unknown) => [
                                typeof value === 'number' ? value : 0,
                                'Tareas',
                            ]}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={32}
                            wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                            formatter={(value) => value}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-xs font-medium text-[var(--color-text-muted)] pt-1 pb-0.5">
                Total: {total} {total === 1 ? 'tarea' : 'tareas'}{' '}
                {totalDescriptor}
            </p>
        </div>
    )
}
