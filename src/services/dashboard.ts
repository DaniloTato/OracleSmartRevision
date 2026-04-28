import {
    getSprints,
    getKpiSummary,
    getRealHoursByUser,
    getUsers,
    getTasksByUserAndSprint,
} from '../api/dashboardApi'

import type { TasksPerSprint } from '../types/dashboard'

export async function loadDashboardData(
    projectId: number,
    sprintId: number
): Promise<{
    sprints: any[]
    summary: any
    tasks: any[]
    hours: any[]
    users: any[]
    multiSprintTasks: TasksPerSprint[]
    multiSprintHours: TasksPerSprint[]
}> {
    const [sprints, summary, tasks, hours, users] = await Promise.all([
        getSprints(projectId),
        getKpiSummary(projectId, sprintId),
        getTasksByUserAndSprint(projectId, sprintId),
        getRealHoursByUser(projectId, sprintId),
        getUsers(),
    ])

    const multiSprintTasks: TasksPerSprint[] = await getTasksByUserPerSprint(
        projectId,
        sprints,
        users
    )

    const multiSprintHours: TasksPerSprint[] = await getHoursByUserPerSprint(
        projectId,
        sprints,
        users
    )

    return {
        sprints,
        summary,
        tasks,
        hours,
        users,
        multiSprintTasks,
        multiSprintHours,
    }
}

export async function getTasksByUserPerSprint(
    projectId: number,
    sprints: any[],
    users: any[]
): Promise<TasksPerSprint[]> {
    const results = await Promise.all(
        sprints.map((s) => getTasksByUserAndSprint(projectId, s.id))
    )

    return sprints.map((sprint, i) => {
        const row: TasksPerSprint = {
            sprint: sprint.name,
        }

        const sprintData = results[i]

        users.forEach((u) => {
            const match = sprintData.find((t: any) => t.user === u.name)
            row[u.name] = match?.tasksCompleted ?? 0
        })

        return row
    })
}

export async function getHoursByUserPerSprint(
    projectId: number,
    sprints: any[],
    users: any[]
) {
    const results = await Promise.all(
        sprints.map((s) => getRealHoursByUser(projectId, s.id))
    )

    return sprints.map((sprint, i) => {
        const row: any = {
            sprint: sprint.name,
        }
        const sprintData = results[i]
        users.forEach((u) => {
            const match = sprintData.find((h: any) => h.user === u.name)
            row[u.name] = match?.hours ?? 0
        })
        return row
    })
}
