//change for deployment
const BASE_URL = '/api'

async function fetchJson(url: string, options?: RequestInit) {
   const res = await fetch(url, {
      headers: {
         'Content-Type': 'application/json',
         ...(options?.headers || {}),
      },
      ...options,
   })

   if (!res.ok) {
      throw new Error(await res.text())
   }

   const text = await res.text()

   if (!text) return null

   return JSON.parse(text)
}

/* PROJECT DATA */
export const getSprints = (projectId: number) =>
   fetchJson(`${BASE_URL}/projects/${projectId}/sprints`)

export const getMembers = (projectId: number) =>
   fetchJson(`${BASE_URL}/projects/${projectId}/members`)

/* TASKS (ISSUES) */
export const getTasks = (projectId: number) =>
   fetchJson(`${BASE_URL}/projects/${projectId}/issues`)

export const createTask = (projectId: number, payload: any) =>
   fetchJson(`${BASE_URL}/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify(payload),
   })

export const updateTask = (id: number, payload: any) =>
   fetchJson(`${BASE_URL}/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
   })

export const deleteTask = (issueId: number) =>
   fetchJson(`${BASE_URL}/issues/${issueId}`, {
      method: 'DELETE',
   })
