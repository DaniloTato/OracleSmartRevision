/**
 * Line chart: "Antes" (baseline) vs "Después" (current) productivity score over time.
 * Uses Recharts; Spanish UI labels. Y-axis 0–100, X-axis from data labels (Sprint / Semana).
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { ProductivityPoint } from '../../mock/productivity'

interface ProductivityChartProps {
  /** Data points: label (X), antes, despues (Y) */
  data: ProductivityPoint[]
  /** Optional height in pixels; default 280 */
  height?: number
}

export function ProductivityChart({ data, height = 280 }: ProductivityChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] text-sm text-[var(--color-text-muted)]"
        style={{ height }}
      >
        No hay datos de productividad.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }} className="min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={{ stroke: 'var(--color-border)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={{ stroke: 'var(--color-border)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{
              value: 'Score de productividad (0-100)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: 'var(--color-text-muted)' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-sidebar-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'var(--color-text)' }}
            formatter={(value: unknown, name: string | undefined) => [
              typeof value === 'number' ? value : 0,
              name === 'antes' ? 'Antes' : 'Después',
            ]}
            labelFormatter={(label) => label}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (value === 'antes' ? 'Antes' : 'Después')}
          />
          <Line
            type="monotone"
            dataKey="antes"
            name="antes"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="despues"
            name="despues"
            stroke="var(--color-oracle-orange)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
