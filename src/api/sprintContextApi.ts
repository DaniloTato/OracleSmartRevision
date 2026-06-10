import type { Sprint } from '../types'
import { apiFetch } from './client'

export const getSprints = (projectId: number) =>
    apiFetch<Sprint[]>(`/projects/${projectId}/sprints`)
