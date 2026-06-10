import { apiFetch } from './client'
import type { KpiSummary, TasksByUser, HoursByUser } from '../types/dashboard'
import type { Sprint, Member } from '../types'
import type { Task } from '../types/Task'

export const getSprints = (projectId: number) =>
    apiFetch<Sprint[]>(`/projects/${projectId}/sprints`)

export const getKpiSummary = (projectId: number, sprintId: number) =>
    apiFetch<KpiSummary>(
        `/projects/${projectId}/kpis/summary?sprintId=${sprintId}`
    )

export const getTasksByUserAndSprint = (projectId: number, sprintId: number) =>
    apiFetch<TasksByUser[]>(
        `/projects/${projectId}/kpis/tasks-by-user?sprintId=${sprintId}`
    )

export const getTasksByUser = (projectId: number) =>
    apiFetch<TasksByUser[]>(`/projects/${projectId}/kpis/tasks-by-user`)

export const getHoursByUser = (projectId: number, sprintId: number) =>
    apiFetch<HoursByUser[]>(
        `/projects/${projectId}/kpis/hours-by-user?sprintId=${sprintId}`
    )

export const getIssuesBySprint = (projectId: number, sprintId: number) =>
    apiFetch<Task[]>(`/projects/${projectId}/issues?sprintId=${sprintId}`)

export const getUsers = () => apiFetch<Member[]>('/users')

export const getRealHoursByUser = (projectId: number, sprintId: number) =>
    apiFetch<HoursByUser[]>(
        `/projects/${projectId}/kpis/real-hours-by-user?sprintId=${sprintId}`
    )
