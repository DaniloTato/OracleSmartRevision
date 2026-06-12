import { useEffect, useMemo, useState } from 'react'

import {
    loadSprintData,
    loadDashboardMetadata,
} from '../services/unifiedServices'

import type { HoursByUser, TasksByUser } from '../types/dashboard'
import type { TasksPerSprint } from '../types/dashboard'
import type { Member, Sprint } from '../types'

export function useUnifiedDashboard() {
    const [selectedSprint, setSelectedSprint] = useState<number | 'all'>('all')
    const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all')

    const [loading, setLoading] = useState(true)

    const [users, setUsers] = useState<Member[]>([])
    const [sprints, setSprints] = useState<Sprint[]>([])

    const [tasksData, setTasksData] = useState<TasksByUser[]>([])
    const [hoursData, setHoursData] = useState<HoursByUser[]>([])

    const [multiSprintTasks, setMultiSprintTasks] = useState<TasksPerSprint[]>(
        []
    )

    const [multiSprintHours, setMultiSprintHours] = useState<TasksPerSprint[]>(
        []
    )

    const userKeys = useMemo(() => {
        return users.map((u) => u.name)
    }, [users])

    useEffect(() => {
        async function loadMetadata() {
            try {
                const data = await loadDashboardMetadata()

                setUsers(data.users)
                setSprints(data.sprints)
                setMultiSprintHours(data.multiSprintHours)
                setMultiSprintTasks(data.multiSprintTasks)
            } catch (err) {
                console.error(err)
            }
        }

        loadMetadata()
    }, [])

    useEffect(() => {
        if (!sprints.length) return

        async function loadData() {
            setLoading(true)

            try {
                const data = await loadSprintData(selectedSprint, sprints)

                setTasksData(data.tasksData)
                setHoursData(data.hoursData)
            } catch (err) {
                console.error(err)
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
        if (selectedDeveloper === 'all') {
            return tasksData
        }

        return tasksData.filter((task) => task.user === selectedDeveloper)
    }, [tasksData, selectedDeveloper])

    const filteredHours = useMemo(() => {
        if (selectedDeveloper === 'all') {
            return hoursData
        }

        return hoursData.filter((hour) => hour.user === selectedDeveloper)
    }, [hoursData, selectedDeveloper])

    const completedTasks = useMemo(() => {
        return filteredTasks.reduce(
            (sum, row) => sum + (row.tasksCompleted ?? 0),
            0
        )
    }, [filteredTasks])

    const totalHours = useMemo(() => {
        return filteredHours.reduce((sum, row) => sum + (row.hours ?? 0), 0)
    }, [filteredHours])

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
        return filteredTasks.map((user) => ({
            label: user.user,
            value: user.tasksCompleted ?? 0,
        }))
    }, [filteredTasks])

    const sprintHoursChartData = useMemo(() => {
        return filteredHours.map((user) => ({
            label: user.user,
            value: user.hours ?? 0,
        }))
    }, [filteredHours])

    return {
        loading,

        selectedSprint,
        setSelectedSprint,

        selectedDeveloper,
        setSelectedDeveloper,

        users,
        developers,

        sprints,
        userKeys,

        tasksData,
        hoursData,

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
    }
}
