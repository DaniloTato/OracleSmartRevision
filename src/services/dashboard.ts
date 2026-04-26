import {
   getSprints,
   getKpiSummary,
   getIssuesBySprint,
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
}> {
   const [sprints, summary, tasks, issues, users] = await Promise.all([
      getSprints(projectId),
      getKpiSummary(projectId, sprintId),
      getTasksByUserAndSprint(projectId, sprintId),
      getIssuesBySprint(projectId, sprintId),
      getUsers(),
   ])

   const multiSprintTasks: TasksPerSprint[] = await getTasksByUserPerSprint(
      projectId,
      sprints,
      users
   )

   return {
      sprints,
      summary,
      tasks,
      hours: groupHoursByUser(issues),
      users,
      multiSprintTasks
   }
}

function groupHoursByUser(issues: any[]) {
   const map = new Map<number, number>()

   for (const issue of issues) {
      if (!issue.assigneeId) continue

      const prev = map.get(issue.assigneeId) ?? 0
      map.set(issue.assigneeId, prev + (issue.actualHours ?? 0))
   }

   return Array.from(map.entries()).map(([userId, hours]) => ({
      userId,
      actualHours: hours,
   }))
}

export async function getTasksByUserPerSprint(
   projectId: number,
   sprints: any[],
   users: any[]
): Promise<TasksPerSprint[]> {
   const results = await Promise.all(
      sprints.map((s) =>
         getTasksByUserAndSprint(projectId, s.id)
      )
   )

   return sprints.map((sprint, i) => {
      const row: TasksPerSprint = {
         sprint: sprint.name,
      }

      const sprintData = results[i]

      users.forEach((u) => {
         const match = sprintData.find(
            (t: any) => t.user === u.name
         )
         row[u.name] = match?.tasksCompleted ?? 0
      })

      return row
   })
}