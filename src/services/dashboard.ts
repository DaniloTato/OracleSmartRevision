import {
   getSprints,
   getKpiSummary,
   getTasksByUser,
   getIssuesBySprint,
   getUsers,
} from '../api/dashboardApi'

export async function loadDashboardData(projectId: number, sprintId: number) {
   const [sprints, summary, tasks, issues, users] = await Promise.all([
      getSprints(projectId),
      getKpiSummary(projectId),
      getTasksByUser(projectId, sprintId),
      getIssuesBySprint(projectId, sprintId),
      getUsers(),
   ])

   return {
      sprints,
      summary,
      tasks,
      hours: groupHoursByUser(issues),
      users,
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
