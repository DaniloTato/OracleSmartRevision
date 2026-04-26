export async function getSprints(projectId: number) {
   const res = await fetch(`/api/projects/${projectId}/sprints`)
   return res.json()
}

export async function getKpiSummary(projectId: number, sprintId: number) {
   const res = await fetch(`/api/projects/${projectId}/kpis/summary?sprintId=${sprintId}`)
   return res.json()
}

export async function getTasksByUserAndSprint(projectId: number, sprintId: number) {
   const res = await fetch(
      `/api/projects/${projectId}/kpis/tasks-by-user?sprintId=${sprintId}`
   )
   return res.json()
}

export async function getTasksByUser(projectId: number) {
   const res = await fetch(
      `/api/projects/${projectId}/kpis/tasks-by-user`
   )
   return res.json()
}

export async function getHoursByUser(projectId: number, sprintId: number) {
   const res = await fetch(
      `/api/projects/${projectId}/kpis/hours-by-user?sprintId=${sprintId}`
   )
   return res.json()
}

export async function getIssuesBySprint(projectId: number, sprintId: number) {
   const res = await fetch(
      `/api/projects/${projectId}/issues?sprintId=${sprintId}`
   )
   return res.json()
}

export async function getUsers() {
   const res = await fetch(`/api/users`)
   return res.json()
}
