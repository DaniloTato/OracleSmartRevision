//change for deployment
const BASE_URL = '/api'

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res.json()
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

export const updateTask = (issueId: number, payload: any) =>
  fetchJson(`${BASE_URL}/issues/${issueId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })