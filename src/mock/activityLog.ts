/**
 * Mock activity log for "Historial de Actividad" page.
 * Chronological list of actions; no API. sprintId used for Sprint filter.
 */

import type { ActivityLogEntry } from '../types'

export const mockActivityLog: ActivityLogEntry[] = [
    {
        id: 1,
        userId: 'u2',
        userName: 'Yael Varela',
        action: 'Completó la tarea',
        entityType: 'tarea',
        entityId: 't1',
        sprintId: 's3',
        details: 'Configurar pipeline CI/CD',
        timestamp: '2025-02-10T14:32:00',
    },
    {
        id: 2,
        userId: 'u3',
        userName: 'Danilo Tato',
        action: 'Cambió estado a "En progreso"',
        entityType: 'tarea',
        entityId: 't2',
        sprintId: 's3',
        details: 'Refactorizar módulo de autenticación',
        timestamp: '2025-02-10T11:15:00',
    },
    {
        id: 3,
        userId: 'u1',
        userName: 'Admin Oracle',
        action: 'Inició sprint',
        entityType: 'sprint',
        entityId: 's3',
        sprintId: 's3',
        details: 'Sprint 3 - Q1 2025',
        timestamp: '2025-02-03T09:00:00',
    },
    {
        id: 4,
        userId: 'u4',
        userName: 'Sebastián Soria',
        action: 'Envió a revisión',
        entityType: 'tarea',
        entityId: 't4',
        sprintId: 's3',
        details: 'Documentar API interna',
        timestamp: '2025-02-09T16:45:00',
    },
    {
        id: 5,
        userId: 'u1',
        userName: 'Admin Oracle',
        action: 'Actualizó configuración',
        entityType: 'sistema',
        details: 'Variables de entorno de staging',
        timestamp: '2025-02-08T10:20:00',
    },
    {
        id: 6,
        userId: 'u5',
        userName: 'Sebastián Certuche',
        action: 'Creó nueva tarea',
        entityType: 'tarea',
        entityId: 't5',
        sprintId: 's3',
        details: 'Revisión de seguridad',
        timestamp: '2025-02-06T13:00:00',
    },
    {
        id: 7,
        userId: 'u2',
        userName: 'Yael Varela',
        action: 'Comentó en tarea',
        entityType: 'tarea',
        entityId: 't4',
        sprintId: 's3',
        details: 'Documentar API interna',
        timestamp: '2025-02-01T12:00:00',
    },
    {
        id: 8,
        userId: 'u1',
        userName: 'Admin Oracle',
        action: 'Cerró sprint',
        entityType: 'sprint',
        entityId: 's2',
        sprintId: 's2',
        details: 'Sprint 2 - Q1 2025',
        timestamp: '2025-02-02T18:00:00',
    },
    {
        id: 9,
        userId: 'u3',
        userName: 'Danilo Tato',
        action: 'Completó la tarea',
        entityType: 'tarea',
        entityId: 't6',
        sprintId: 's2',
        details: 'Dashboard de métricas',
        timestamp: '2025-02-15T10:00:00',
    },
]

export function getActivityLog(limit?: number): ActivityLogEntry[] {
    const sorted = [...mockActivityLog].sort(
        (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    return limit ? sorted.slice(0, limit) : sorted
}
