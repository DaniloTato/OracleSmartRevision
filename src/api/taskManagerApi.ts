import type { CreateTaskDto } from '../types/Task'
import type { Feature, Sprint, Member } from '../types'
import type { Task } from '../types/Task'

//change for deployment
const BASE_URL = '/api'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
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
    if (!text) return null as T

    return JSON.parse(text) as T
}

/* PROJECT DATA */
export const getSprints = (projectId: number) =>
    fetchJson<Sprint[]>(`${BASE_URL}/projects/${projectId}/sprints`)

export const getMembers = (projectId: number) =>
    fetchJson<Member[]>(`${BASE_URL}/projects/${projectId}/members`)

/* TASKS (ISSUES) */
export const getTasks = (projectId: number) =>
    fetchJson<Task[]>(`${BASE_URL}/projects/${projectId}/issues`)

export const getFeaturesBySprint = (sprintId: number) =>
    fetchJson<Feature[]>(`${BASE_URL}/sprints/${sprintId}/features`) as Promise<
        Feature[]
    >

export const createTask = (projectId: number, payload: CreateTaskDto) =>
    fetchJson<Task>(`${BASE_URL}/projects/${projectId}/issues`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const updateTask = (id: number, payload: Partial<Task>) =>
    fetchJson<Task>(`${BASE_URL}/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    })

export const deleteTask = (issueId: number) =>
    fetchJson<Task>(`${BASE_URL}/issues/${issueId}`, {
        method: 'DELETE',
    })
