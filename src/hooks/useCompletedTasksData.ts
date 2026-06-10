import { useEffect, useState } from 'react'
import type { TasksByUser } from '../types/dashboard'

const BASE_URL = '/api'

async function fetchTasksByUserAndSprint(
    projectId: number,
    sprintId: number
): Promise<TasksByUser[]> {
    const res = await fetch(
        `${BASE_URL}/projects/${projectId}/kpis/tasks-by-user?sprintId=${sprintId}`
    )
    if (!res.ok) throw new Error('Failed to fetch sprint tasks')
    return res.json()
}

async function fetchTasksByUser(projectId: number): Promise<TasksByUser[]> {
    const res = await fetch(
        `${BASE_URL}/projects/${projectId}/kpis/tasks-by-user`
    )
    if (!res.ok) throw new Error('Failed to fetch all-time tasks')
    return res.json()
}

interface CompletedTasksData {
    sprintTasks: TasksByUser[]
    allTimeTasks: TasksByUser[]
    loading: boolean
}

export function useCompletedTasksData(
    projectId: number,
    sprintId: number
): CompletedTasksData {
    const [sprintTasks, setSprintTasks] = useState<TasksByUser[]>([])
    const [allTimeTasks, setAllTimeTasks] = useState<TasksByUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const [sprint, allTime] = await Promise.all([
                    fetchTasksByUserAndSprint(projectId, sprintId),
                    fetchTasksByUser(projectId),
                ])
                setSprintTasks(sprint ?? [])
                setAllTimeTasks(allTime ?? [])
            } catch (err) {
                console.error('CompletedTasks load failed', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [projectId, sprintId])

    return { sprintTasks, allTimeTasks, loading }
}
