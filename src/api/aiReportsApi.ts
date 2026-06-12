import { apiFetch } from './client'
import type { DelayReport } from '../types/DelayReport'

export async function fetchReports(): Promise<DelayReport[]> {
    return apiFetch<DelayReport[]>('/overdue-reports')
}
