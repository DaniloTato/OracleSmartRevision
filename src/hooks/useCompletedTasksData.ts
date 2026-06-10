import { useEffect, useState } from 'react'
import type { TasksByUser } from '../types/dashboard'
import { getTasksByUser, getTasksByUserAndSprint } from '../api/dashboardApi'

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
                    getTasksByUserAndSprint(projectId, sprintId),
                    getTasksByUser(projectId),
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
    return {
        sprintTasks,
        allTimeTasks,
        loading,
    }
}
