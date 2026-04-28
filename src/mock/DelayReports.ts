import type { DelayReport, SprintDelayReport } from '../types/DelayReport'

export const mockReports: DelayReport[] = [
    {
        id: 1,
        taskTitle: 'Fix login authentication bug',
        developerName: 'Danilo',
        dueDate: '2026-04-20T00:00:00Z',
        submittedAt: '2026-04-21T10:30:00Z',
        reason: 'Backend API inconsistency',
        aiSummary: 'Dependencia externa bloqueó el progreso.',
        aiCategory: 'external_dependency',
        severity: 'medium',
        impact: {
            delayDays: 1,
            impactLevel: 'medium',
            description: 'Afecta funcionalidades dependientes del login.',
        },
        recommendation: 'Usar mocks para desacoplar frontend del backend.',
    },
    {
        id: 2,
        taskTitle: 'Implement dashboard charts',
        developerName: 'Ana',
        dueDate: '2026-04-18T00:00:00Z',
        submittedAt: '2026-04-19T09:10:00Z',
        reason: 'Task bigger than expected',
        aiSummary: 'Subestimación de complejidad.',
        aiCategory: 'underestimated',
        severity: 'high',
        impact: {
            delayDays: 1,
            impactLevel: 'high',
            description: 'Retrasa métricas clave del dashboard.',
        },
        recommendation: 'Dividir tareas grandes en subtareas más pequeñas.',
    },
    {
        id: 3,
        taskTitle: 'Drag & drop integration',
        developerName: 'Luis',
        dueDate: '2026-04-19T00:00:00Z',
        submittedAt: '2026-04-20T14:45:00Z',
        reason: 'Library integration issues',
        aiSummary: 'Problema técnico interno.',
        aiCategory: 'blocked',
        severity: 'medium',
        impact: {
            delayDays: 1,
            impactLevel: 'medium',
            description: 'Bloquea asignación eficiente de tareas.',
        },
        recommendation:
            'Asignar tiempo de investigación para nuevas librerías.',
    },
]

export const mockSprintReport: SprintDelayReport = {
    sprintId: 1,
    totalDelayedTasks: 3,
    totalDelayDays: 3,

    impact: {
        overallImpact: 'medium',
        summary:
            'Los retrasos afectan parcialmente la entrega del sprint, con impacto moderado en funcionalidades clave.',
    },

    mainCauses: [
        { category: 'external_dependency', count: 1 },
        { category: 'underestimated', count: 1 },
        { category: 'blocked', count: 1 },
    ],

    recommendations: [
        'Mejorar estimaciones iniciales.',
        'Reducir dependencias externas.',
        'Planificar tiempo para investigación técnica.',
    ],

    suggestedAdjustments: {
        suggestedEndDate: '2026-04-23T00:00:00Z',
        notes: 'Se recomienda extender el sprint 1-2 días.',
    },
}
