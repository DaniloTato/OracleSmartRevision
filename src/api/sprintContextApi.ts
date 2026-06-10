import { apiFetch } from './client'
import type { Sprint } from '../types'

export const getSprints = (projectId: number) =>
    apiFetch<Sprint[]>(`/projects/${projectId}/sprints`)
