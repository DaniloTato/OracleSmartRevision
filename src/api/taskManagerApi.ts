import type { CreateTaskDto } from '../types/Task'
import type { Feature, Sprint, Member } from '../types'
import type { Task } from '../types/Task'
import { apiFetch } from './client'

export const getSprints = (projectId: number) =>
    apiFetch<Sprint[]>(`/projects/${projectId}/sprints`)

export const getMembers = (projectId: number) =>
    apiFetch<Member[]>(`/projects/${projectId}/members`)

export const getTasks = (projectId: number) =>
    apiFetch<Task[]>(`/projects/${projectId}/issues`)

export const getFeaturesBySprint = (sprintId: number) =>
    apiFetch<Feature[]>(`/sprints/${sprintId}/features`)

export const createTask = (projectId: number, payload: CreateTaskDto) =>
    apiFetch<Task>(`/projects/${projectId}/issues`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

export const updateTask = (id: number, payload: Partial<Task>) =>
    apiFetch<Task>(`/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    })

export const deleteTask = (issueId: number) =>
    apiFetch<void>(`/issues/${issueId}`, {
        method: 'DELETE',
    })
