import { useMemo } from 'react'
import {
    HiOutlineCheckCircle,
    HiOutlineUserGroup,
    HiOutlineTrendingUp,
} from 'react-icons/hi'
import { useSprint } from '../context/SprintContext'
import { useCompletedTasksData } from '../hooks/useCompletedTasksData'
import { Section } from '../components/ui/Section'
import { KpiCard } from '../components/ui/KpiCard'
import { Table, THead, TRow, TH, TD } from '../components/ui/Table'

const PROJECT_ID = 1

export function CompletedTasksPage() {
    const { selectedSprintId } = useSprint()
    const sprintId = selectedSprintId ?? 1

    const { sprintTasks, allTimeTasks, loading } = useCompletedTasksData(
        PROJECT_ID,
        sprintId
    )

    const totalSprintCompleted = useMemo(
        () => sprintTasks.reduce((sum, u) => sum + (u.tasksCompleted ?? 0), 0),
        [sprintTasks]
    )

    const avgTasks = useMemo(() => {
        if (!sprintTasks.length) return 0
        return Math.round(totalSprintCompleted / sprintTasks.length)
    }, [sprintTasks, totalSprintCompleted])

    if (loading) {
        return (
            <div className="p-4 text-muted">Cargando tareas completadas...</div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                    <HiOutlineCheckCircle className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-text)]">
                        Tareas Completadas
                    </h1>
                    <p className="text-sm text-muted">
                        Desempeño por desarrollador en el sprint actual
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <KpiCard
                    title="Total Completadas"
                    value={totalSprintCompleted}
                    subtitle="Sprint actual"
                    icon={HiOutlineCheckCircle}
                    color="data-2"
                />
                <KpiCard
                    title="Promedio por Dev"
                    value={avgTasks}
                    subtitle="Sprint actual"
                    icon={HiOutlineTrendingUp}
                    color="data-1"
                />
                <KpiCard
                    title="Desarrolladores"
                    value={sprintTasks.length}
                    subtitle="Con tareas completadas"
                    icon={HiOutlineUserGroup}
                    color="data-3"
                />
            </div>

            {/* Sprint breakdown table */}
            <Section
                title="Por desarrollador — Sprint actual"
                icon={HiOutlineCheckCircle}
            >
                <Table>
                    <THead>
                        <TRow>
                            <TH>#</TH>
                            <TH>Desarrollador</TH>
                            <TH className="text-right">Tareas completadas</TH>
                            <TH className="text-right">% del total</TH>
                        </TRow>
                    </THead>
                    <tbody>
                        {[...sprintTasks]
                            .sort(
                                (a, b) =>
                                    (b.tasksCompleted ?? 0) -
                                    (a.tasksCompleted ?? 0)
                            )
                            .map((row, i) => {
                                const pct =
                                    totalSprintCompleted > 0
                                        ? Math.round(
                                              ((row.tasksCompleted ?? 0) /
                                                  totalSprintCompleted) *
                                                  100
                                          )
                                        : 0
                                return (
                                    <TRow key={row.user}>
                                        <TD className="text-muted">{i + 1}</TD>
                                        <TD className="font-medium">
                                            {row.user}
                                        </TD>
                                        <TD className="text-right font-semibold text-[var(--color-data-2)]">
                                            {row.tasksCompleted ?? 0}
                                        </TD>
                                        <TD className="text-right text-muted">
                                            {pct}%
                                        </TD>
                                    </TRow>
                                )
                            })}
                        {sprintTasks.length === 0 && (
                            <TRow>
                                <TD
                                    className="text-muted text-center"
                                    colSpan={4}
                                >
                                    No hay datos para este sprint.
                                </TD>
                            </TRow>
                        )}
                    </tbody>
                </Table>
            </Section>

            {/* All-time breakdown table */}
            <Section
                title="Histórico — Todos los sprints"
                icon={HiOutlineTrendingUp}
            >
                <Table>
                    <THead>
                        <TRow>
                            <TH>#</TH>
                            <TH>Desarrollador</TH>
                            <TH className="text-right">Total completadas</TH>
                        </TRow>
                    </THead>
                    <tbody>
                        {[...allTimeTasks]
                            .sort(
                                (a, b) =>
                                    (b.tasksCompleted ?? 0) -
                                    (a.tasksCompleted ?? 0)
                            )
                            .map((row, i) => (
                                <TRow key={row.user}>
                                    <TD className="text-muted">{i + 1}</TD>
                                    <TD className="font-medium">{row.user}</TD>
                                    <TD className="text-right font-semibold text-[var(--color-data-1)]">
                                        {row.tasksCompleted ?? 0}
                                    </TD>
                                </TRow>
                            ))}
                        {allTimeTasks.length === 0 && (
                            <TRow>
                                <TD
                                    className="text-muted text-center"
                                    colSpan={3}
                                >
                                    No hay datos históricos disponibles.
                                </TD>
                            </TRow>
                        )}
                    </tbody>
                </Table>
            </Section>
        </div>
    )
}
