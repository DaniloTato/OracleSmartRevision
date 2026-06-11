import { useEffect, useMemo, useState } from 'react'
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineTrendingUp,
    HiOutlineUserGroup,
} from 'react-icons/hi'

import { useSprint } from '../context/SprintContext'
import { Section } from '../components/ui/Section'
import { KpiCard } from '../components/ui/KpiCard'
import { Table, THead, TRow, TH, TD } from '../components/ui/Table'
import {
    getRealHoursByUser,
    getTasksByUser,
    getTasksByUserAndSprint,
} from '../api/dashboardApi'
import type { HoursByUser, TasksByUser } from '../types/dashboard'
import type { TasksPerSprint } from '../types/dashboard'
import type { Member } from '../types'
import {
    getTasksByUserPerSprint,
    getHoursByUserPerSprint,
} from '../services/dashboard'
import { getUsers } from '../api/dashboardApi'
import { MultiBarChart } from '../components/charts/MultiBarChart'
import { GenericBarChart } from '../components/charts/GenericBarChart'

const PROJECT_ID = 1

export function UnifiedDashboard() {
    const { sprints } = useSprint()

    const [selectedSprint, setSelectedSprint] = useState<number | 'all'>('all')

    const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all')
    const [tasksData, setTasksData] = useState<TasksByUser[]>([])
    const [hoursData, setHoursData] = useState<HoursByUser[]>([])
    const [loading, setLoading] = useState(true)
    const [multiSprintTasks, setmultiSprintTasks] = useState<TasksPerSprint[]>(
        []
    )
    const [multiSprintHours, setMultiSprintHours] = useState<TasksPerSprint[]>(
        []
    )

    const [users, setUsers] = useState<Member[]>([])

    const userKeys = useMemo(() => {
        return users.map((u) => u.name)
    }, [users])

    useEffect(() => {
        async function loadData() {
            setLoading(true)

            try {
                const fetchedUsers = await getUsers()
                setUsers(fetchedUsers)
                setMultiSprintHours(
                    await getHoursByUserPerSprint(
                        PROJECT_ID,
                        sprints,
                        fetchedUsers
                    )
                )
                setmultiSprintTasks(
                    await getTasksByUserPerSprint(
                        PROJECT_ID,
                        sprints,
                        fetchedUsers
                    )
                )
                if (selectedSprint === 'all') {
                    const [tasks, hoursBySprint] = await Promise.all([
                        getTasksByUser(PROJECT_ID),
                        Promise.all(
                            sprints.map((sprint) =>
                                getRealHoursByUser(PROJECT_ID, sprint.id)
                            )
                        ),
                    ])

                    const hoursByUser = new Map<string, HoursByUser>()

                    hoursBySprint.flat().forEach((row) => {
                        const current = hoursByUser.get(row.user)
                        hoursByUser.set(row.user, {
                            ...row,
                            hours: (current?.hours ?? 0) + (row.hours ?? 0),
                        })
                    })

                    setTasksData(tasks ?? [])
                    setHoursData([...hoursByUser.values()])
                    return
                }

                const [tasks, hours] = await Promise.all([
                    getTasksByUserAndSprint(PROJECT_ID, selectedSprint),
                    getRealHoursByUser(PROJECT_ID, selectedSprint),
                ])

                setTasksData(tasks ?? [])
                setHoursData(hours ?? [])
            } catch (err) {
                console.error('TasksHoursDashboard load failed', err)
                setTasksData([])
                setHoursData([])
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [selectedSprint, sprints])

    const developers = useMemo(() => {
        return Array.from(
            new Set([
                ...tasksData.map((x) => x.user),
                ...hoursData.map((x) => x.user),
            ])
        )
    }, [tasksData, hoursData])

    const filteredTasks = useMemo(() => {
        if (selectedDeveloper === 'all') return tasksData

        return tasksData.filter((t) => t.user === selectedDeveloper)
    }, [tasksData, selectedDeveloper])

    const filteredHours = useMemo(() => {
        if (selectedDeveloper === 'all') return hoursData

        return hoursData.filter((h) => h.user === selectedDeveloper)
    }, [hoursData, selectedDeveloper])

    const completedTasks = useMemo(
        () =>
            filteredTasks.reduce(
                (sum, row) => sum + (row.tasksCompleted ?? 0),
                0
            ),
        [filteredTasks]
    )

    const totalHours = useMemo(
        () => filteredHours.reduce((sum, row) => sum + (row.hours ?? 0), 0),
        [filteredHours]
    )

    const avgTasks = useMemo(() => {
        if (!filteredTasks.length) return 0

        return Math.round(completedTasks / filteredTasks.length)
    }, [completedTasks, filteredTasks])

    const avgHours = useMemo(() => {
        if (!filteredHours.length) return 0

        return Math.round(totalHours / filteredHours.length)
    }, [totalHours, filteredHours])

    const medianTasks = useMemo(() => {
        const values = filteredTasks
            .map((x) => x.tasksCompleted ?? 0)
            .sort((a, b) => a - b)

        if (!values.length) return 0

        const mid = Math.floor(values.length / 2)

        return values.length % 2
            ? values[mid]
            : Math.round((values[mid - 1] + values[mid]) / 2)
    }, [filteredTasks])

    const medianHours = useMemo(() => {
        const values = filteredHours
            .map((x) => x.hours ?? 0)
            .sort((a, b) => a - b)

        if (!values.length) return 0

        const mid = Math.floor(values.length / 2)

        return values.length % 2
            ? values[mid]
            : Math.round((values[mid - 1] + values[mid]) / 2)
    }, [filteredHours])

    const rows = useMemo(() => {
        return developers.map((developer) => {
            const taskRow = tasksData.find((t) => t.user === developer)

            const hourRow = hoursData.find((h) => h.user === developer)

            return {
                developer,
                tasks: taskRow?.tasksCompleted ?? 0,
                hours: hourRow?.hours ?? 0,
            }
        })
    }, [developers, tasksData, hoursData])

    const sprintTasksChartData = useMemo(() => {
        return filteredTasks.map((u) => ({
            label: u.user,
            value: u.tasksCompleted ?? 0,
        }))
    }, [filteredTasks])

    const sprintHoursChartData = useMemo(() => {
        return filteredHours.map((u) => ({
            label: u.user,
            value: u.hours ?? 0,
        }))
    }, [filteredHours])

    if (loading) {
        return <div className="p-4 text-muted">Cargando métricas...</div>
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}

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

            {/* FILTERS */}

            <div className="flex gap-4">
                <select
                    value={selectedSprint}
                    onChange={(e) =>
                        setSelectedSprint(
                            e.target.value === 'all'
                                ? 'all'
                                : Number(e.target.value)
                        )
                    }
                    className="rounded-lg border border-default px-3 py-2"
                >
                    <option value="all">All Sprints</option>

                    {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedDeveloper}
                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                    className="rounded-lg border border-default px-3 py-2"
                >
                    <option value="all">All Devs</option>

                    {developers.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>

            {/* KPIs */}

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

            {/* ================= TASKS ================= */}

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

            {/* ================= HOURS ================= */}

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

            {/* DETAIL TABLE */}

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
