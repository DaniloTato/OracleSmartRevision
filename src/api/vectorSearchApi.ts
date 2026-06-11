import { apiFetch } from './client'
import type { Task } from '../types/Task'

export const semanticSearch = (projectId: number, query: string) =>
    apiFetch<Task[]>(
        `/projects/${projectId}/issues/semantic-search?search=${encodeURIComponent(query)}`
    )

export const reindexEmbeddings = (projectId: number) =>
    apiFetch<{ projectId: number; updated: number }>(
        `/projects/${projectId}/issues/reindex-embeddings`,
        {
            method: 'POST',
        }
    )
