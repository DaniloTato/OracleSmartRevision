import {
    getRealHoursByUser,
    getTasksByUser,
    getTasksByUserAndSprint,
    getUsers,
} from '../api/dashboardApi'

import { getSprints } from '../api/taskManagerApi'

import type { HoursByUser, TasksByUser } from '../types/dashboard'
import type { Member, Sprint } from '../types'
import type { TasksPerSprint } from '../types/dashboard'

const PROJECT_ID = 1

export async function getTasksByUserPerSprint(
    projectId: number,
    sprints: Sprint[],
    users: Member[]
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
            const match = sprintData.find((t: TasksByUser) => t.user === u.name)
            row[u.name] = match?.tasksCompleted ?? 0
        })

        return row
    })
}

type SprintRow = {
    sprint: string
    [userName: string]: string | number
}

export async function getHoursByUserPerSprint(
    projectId: number,
    sprints: Sprint[],
    users: Member[]
) {
    const results = await Promise.all(
        sprints.map((s) => getRealHoursByUser(projectId, s.id))
    )

    return sprints.map((sprint, i) => {
        const row: SprintRow = {
            sprint: sprint.name,
        }
        const sprintData = results[i]
        users.forEach((u) => {
            const match = sprintData.find((h: HoursByUser) => h.user === u.name)
            row[u.name] = match?.hours ?? 0
        })
        return row
    })
}

export async function loadDashboardMetadata() {
    const [users, sprints] = await Promise.all([
        getUsers(),
        getSprints(PROJECT_ID),
    ])

    const [multiSprintHours, multiSprintTasks] = await Promise.all([
        getHoursByUserPerSprint(PROJECT_ID, sprints, users),
        getTasksByUserPerSprint(PROJECT_ID, sprints, users),
    ])

    return {
        users,
        sprints,
        multiSprintHours,
        multiSprintTasks,
    }
}

export async function loadSprintData(
    sprintId: number | 'all',
    sprints: Sprint[]
) {
    if (sprintId === 'all') {
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

        return {
            tasksData: tasks ?? [],
            hoursData: [...hoursByUser.values()],
        }
    }

    const [tasks, hours] = await Promise.all([
        getTasksByUserAndSprint(PROJECT_ID, sprintId),
        getRealHoursByUser(PROJECT_ID, sprintId),
    ])

    return {
        tasksData: tasks ?? [],
        hoursData: hours ?? [],
    }
}
