import { HiOutlineSparkles, HiOutlineExclamationCircle } from 'react-icons/hi'
import { useMemo, useEffect, useState } from 'react'

import { Section } from '../components/ui/Section'
import { KpiCard } from '../components/ui/KpiCard'
import { Badge } from '../components/ui/Badge'
import { formatDate } from '../helpers/FormatDate'
import { SeverityBadge } from '../components/ui/SeverityBadge'

import type { DelayReport, SprintDelayReport } from '../types/DelayReport'
import { fetchReports } from '../api/aiReportsApi'

export function AiReportsPage() {
    const [reports, setReports] = useState<DelayReport[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function load() {
            try {
                const data = await fetchReports()
                if (mounted) setReports(data)
            } catch (err) {
                console.error('Error fetching reports:', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()

        return () => {
            mounted = false
        }
    }, [])

    const sprintReport: SprintDelayReport = useMemo(() => {
        if (!reports.length) {
            return {
                sprintId: undefined,
                totalDelayedTasks: 0,
                totalDelayDays: 0,
                avgDelayDays: 0,

                impact: {
                    overallImpact: 'low',
                    summary: 'Sin datos aún',
                },

                mainCauses: [],
                recommendations: [],
                suggestedAdjustments: {
                    suggestedEndDate: null,
                    notes: 'Sin datos suficientes',
                },
            }
        }

        const totalDelay = reports.reduce((acc, r) => acc + r.delayDays, 0)
        const avgDelay = totalDelay / reports.length

        const severityCount = reports.reduce((acc, r) => {
            acc[r.severity] = (acc[r.severity] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const categoryCount = reports.reduce((acc, r) => {
            acc[r.aiCategory] = (acc[r.aiCategory] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const mainCauses = Object.entries(categoryCount)
            .map(([category, count]) => ({
                category: category as DelayReport['aiCategory'],
                count,
            }))
            .sort((a, b) => b.count - a.count)

        const overallImpact: 'low' | 'medium' | 'high' =
            avgDelay > 3 || severityCount.high > 2
                ? 'high'
                : avgDelay > 1.5
                ? 'medium'
                : 'low'

        const recommendations = [
            severityCount.high
                ? `${severityCount.high} tareas críticas requieren atención inmediata`
                : 'No hay tareas críticas',

            avgDelay > 2
                ? 'El promedio de retraso es alto, revisar planificación'
                : 'Retrasos dentro de rango aceptable',
        ]

        const suggestedEndDate =
            avgDelay > 2
                ? new Date(Date.now() + Math.ceil(avgDelay) * 86400000)
                : null

        return {
            sprintId: undefined,

            totalDelayedTasks: reports.length,
            totalDelayDays: totalDelay,
            avgDelayDays: avgDelay,

            impact: {
                overallImpact,
                summary: `Se registraron ${reports.length} retrasos con un promedio de ${avgDelay.toFixed(
                    1
                )} días`,
            },

            mainCauses,
            recommendations,

            suggestedAdjustments: {
                suggestedEndDate: suggestedEndDate
                    ? suggestedEndDate.toISOString()
                    : null,
                notes:
                    avgDelay > 2
                        ? 'Se recomienda extender el sprint ligeramente'
                        : 'No es necesario ajustar el sprint',
            },
        }
    }, [reports])

    const total = reports.length

    const highSeverity = useMemo(
        () => reports.filter((r) => r.severity === 'high').length,
        [reports]
    )

    const categories = useMemo(() => {
        return reports.reduce(
            (acc, r) => {
                acc[r.aiCategory] = (acc[r.aiCategory] || 0) + 1
                return acc
            },
            {} as Record<string, number>
        )
    }, [reports])

    if (loading) {
        return (
            <div className="p-6 text-muted">
                Cargando reportes...
            </div>
        )
    }

    return (
        <div className="dark-page min-h-screen p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-data-2 text-white">
                    <HiOutlineSparkles className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">
                        AI Delay Reports
                    </h1>
                    <p className="text-sm text-muted">
                        Análisis automático de tareas fuera de tiempo
                    </p>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <KpiCard
                    title="Reportes generados"
                    value={total}
                    subtitle="Tareas con retraso"
                    icon={HiOutlineSparkles}
                    color="data-2"
                />

                <KpiCard
                    title="Alta severidad"
                    value={highSeverity}
                    subtitle="Requieren atención"
                    icon={HiOutlineExclamationCircle}
                    color="data-4"
                />
            </div>

            {/* Sprint Impact */}
            <Section title="Impacto general del sprint">
                <div className="space-y-4">
                    <p className="text-sm text-muted">
                        {sprintReport.impact.summary}
                    </p>

                    <div>
                        <p className="font-semibold">
                            Recomendaciones:
                        </p>
                        <ul className="list-disc ml-5 text-sm text-muted">
                            {sprintReport.recommendations.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </div>

                    {sprintReport.suggestedAdjustments.suggestedEndDate && (
                        <div className="bg-suggestion-soft p-3 rounded-lg">
                            <p className="text-sm font-semibold">
                                Nueva fecha sugerida:{' '}
                                {formatDate(
                                    sprintReport.suggestedAdjustments
                                        .suggestedEndDate
                                )}
                            </p>
                            <p className="text-xs text-muted">
                                {sprintReport.suggestedAdjustments.notes}
                            </p>
                        </div>
                    )}
                </div>
            </Section>

            {/* Category summary */}
            <Section title="Causas principales detectadas por IA">
                <div className="flex flex-wrap gap-3">
                    {Object.entries(categories).map(([key, value]) => (
                        <Badge key={key} variant="info">
                            {key} — {value}
                        </Badge>
                    ))}
                </div>
            </Section>

            {/* Reports list */}
            <Section title="Reportes detallados">
                <div className="space-y-4">
                    {reports.map((r) => (
                        <div
                            key={r.id}
                            className="bg-surface border border-default rounded-xl p-4 space-y-4"
                        >
                            {/* Top */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">
                                        {r.taskTitle}
                                    </h3>
                                    <p className="text-sm text-muted">
                                        {r.developerName} •{' '}
                                        {formatDate(r.dueDate)}
                                    </p>
                                </div>

                                <SeverityBadge severity={r.severity} />
                            </div>

                            {/* AI Summary */}
                            <div className="bg-soft rounded-lg p-3">
                                <p className="text-sm">
                                    <span className="font-semibold">
                                        IA:
                                    </span>{' '}
                                    {r.aiSummary}
                                </p>
                            </div>

                            {/* Impact */}
                            <div className="bg-info-soft rounded-lg p-3">
                                <p className="text-sm">
                                    <span className="font-semibold">
                                        Impacto:
                                    </span>{' '}
                                    {r.description}
                                </p>
                                <p className="text-xs text-muted">
                                    Retraso: {r.delayDays} días
                                </p>
                            </div>

                            {/* Recommendation */}
                            <div className="bg-success-soft rounded-lg p-3">
                                <p className="text-sm">
                                    <span className="font-semibold">
                                        Recomendación:
                                    </span>{' '}
                                    {r.recommendation}
                                </p>
                            </div>

                            {/* Raw reason */}
                            <div>
                                <p className="text-xs text-muted">
                                    Respuesta del desarrollador:
                                </p>
                                <p className="text-sm italic">
                                    "{r.reason}"
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center text-xs text-muted">
                                <span>Categoría: {r.aiCategory}</span>
                                <span>
                                    {formatDate(r.submittedAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    )
}