import { apiFetch } from './client'

export const getSprints = (projectId: number) =>
    apiFetch(`/projects/${projectId}/sprints`)

export const getKpiSummary = (projectId: number, sprintId: number) =>
    apiFetch(`/projects/${projectId}/kpis/summary?sprintId=${sprintId}`)

export const getTasksByUserAndSprint = (projectId: number, sprintId: number) =>
    apiFetch(`/projects/${projectId}/kpis/tasks-by-user?sprintId=${sprintId}`)

export const getTasksByUser = (projectId: number) =>
    apiFetch(`/projects/${projectId}/kpis/tasks-by-user`)

export const getHoursByUser = (projectId: number, sprintId: number) =>
    apiFetch(`/projects/${projectId}/kpis/hours-by-user?sprintId=${sprintId}`)

export const getIssuesBySprint = (projectId: number, sprintId: number) =>
    apiFetch(`/projects/${projectId}/issues?sprintId=${sprintId}`)

export const getUsers = () => apiFetch('/users')

export const getRealHoursByUser = (projectId: number, sprintId: number) =>
    apiFetch(
        `/projects/${projectId}/kpis/real-hours-by-user?sprintId=${sprintId}`
    )
