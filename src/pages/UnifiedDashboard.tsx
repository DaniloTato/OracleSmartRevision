import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineTrendingUp,
    HiOutlineUserGroup,
} from 'react-icons/hi'

import { Section } from '../components/ui/Section'
import { KpiCard } from '../components/ui/KpiCard'
import { Table, THead, TRow, TH, TD } from '../components/ui/Table'

import { MultiBarChart } from '../components/charts/MultiBarChart'
import { GenericBarChart } from '../components/charts/GenericBarChart'
import { useUnifiedDashboard } from '../hooks/useUnifiedDashboard'
import { Select } from '../components/ui/Select'

export function UnifiedDashboard() {
    const {
        loading,

        selectedSprint,
        setSelectedSprint,

        selectedDeveloper,
        setSelectedDeveloper,

        sprints,
        developers,
        userKeys,

        multiSprintTasks,
        multiSprintHours,

        completedTasks,
        totalHours,

        avgTasks,
        avgHours,

        medianTasks,
        medianHours,

        rows,

        sprintTasksChartData,
        sprintHoursChartData,
    } = useUnifiedDashboard()

    if (loading) {
        return <div className="p-4 text-muted">Cargando métricas...</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                    <HiOutlineTrendingUp className="w-6 h-6" />
                </div>

                <div>
                    <h1 className="text-2xl font-semibold">
                        Análisis de Tasks / Hours
                    </h1>

                    <p className="text-sm text-muted">
                        Dashboard ejecutivo de productividad
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <Select
                    value={selectedSprint}
                    onChange={(value) =>
                        setSelectedSprint(
                            value === 'all' ? 'all' : Number(value)
                        )
                    }
                    options={[
                        {
                            value: 'all',
                            label: 'All Sprints',
                        },
                        ...sprints.map((sprint) => ({
                            value: sprint.id,
                            label: sprint.name,
                        })),
                    ]}
                />

                <Select
                    value={selectedDeveloper}
                    onChange={setSelectedDeveloper}
                    options={[
                        {
                            value: 'all',
                            label: 'All Devs',
                        },
                        ...developers.map((developer) => ({
                            value: developer,
                            label: developer,
                        })),
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">
                <KpiCard
                    title="Completed Tasks"
                    value={completedTasks}
                    subtitle="Selected filters"
                    icon={HiOutlineCheckCircle}
                    color="data-2"
                />

                <KpiCard
                    title="Total Real Hours"
                    value={totalHours}
                    subtitle="Selected filters"
                    icon={HiOutlineClock}
                    color="data-3"
                />

                <KpiCard
                    title="Avg Task/Dev"
                    value={avgTasks}
                    subtitle="Selected filters"
                    icon={HiOutlineUserGroup}
                    color="data-1"
                />

                <KpiCard
                    title="Avg Hours/Dev"
                    value={avgHours}
                    subtitle="Selected filters"
                    icon={HiOutlineTrendingUp}
                    color="data-4"
                />

                <KpiCard
                    title="Median Task/Dev"
                    value={medianTasks}
                    subtitle="Selected filters"
                    icon={HiOutlineCheckCircle}
                    color="data-2"
                />

                <KpiCard
                    title="Median Hours/Dev"
                    value={medianHours}
                    subtitle="Selected filters"
                    icon={HiOutlineClock}
                    color="data-3"
                />
            </div>

            {selectedSprint === 'all' ? (
                <Section title="Tareas completadas por sprint y desarrollador">
                    <MultiBarChart
                        data={multiSprintTasks}
                        keys={userKeys}
                        xKey="sprint"
                        title="Tareas completadas por desarrollador por sprint"
                        description="Comparación del desempeño entre sprints"
                    />
                </Section>
            ) : (
                <Section title="Tareas completadas por desarrollador">
                    <GenericBarChart
                        data={sprintTasksChartData}
                        title="Tareas completadas por integrante"
                        description="Desempeño de cada desarrollador en el sprint seleccionado"
                        xAxisLabel="Tareas completadas"
                        valueLabel="Tareas"
                    />
                </Section>
            )}

            {selectedSprint === 'all' ? (
                <Section title="Horas trabajadas por sprint y desarrollador">
                    <MultiBarChart
                        data={multiSprintHours}
                        keys={userKeys}
                        xKey="sprint"
                        title="Horas por desarrollador por sprint"
                        description="Comparación de horas trabajadas entre sprints"
                    />
                </Section>
            ) : (
                <Section title="Horas trabajadas por desarrollador">
                    <GenericBarChart
                        data={sprintHoursChartData}
                        title="Horas reales por integrante"
                        description="Horas registradas en el sprint seleccionado"
                        xAxisLabel="Horas trabajadas"
                        valueLabel="Horas"
                    />
                </Section>
            )}

            <Section
                title="Detalle por desarrollador"
                icon={HiOutlineUserGroup}
            >
                <Table>
                    <THead>
                        <TRow>
                            <TH>Developer</TH>
                            <TH className="text-right">Tasks</TH>
                            <TH className="text-right">Hours</TH>
                        </TRow>
                    </THead>

                    <tbody>
                        {rows.map((row) => (
                            <TRow key={row.developer}>
                                <TD>{row.developer}</TD>

                                <TD className="text-right">{row.tasks}</TD>

                                <TD className="text-right">{row.hours}</TD>
                            </TRow>
                        ))}
                    </tbody>
                </Table>
            </Section>
        </div>
    )
}
