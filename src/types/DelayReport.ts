export type DelayReport = {
    id: number
    taskTitle: string
    developerName: string
    dueDate: string
    submittedAt: string
    reason: string
    aiSummary: string
    aiCategory: 'blocked' | 'underestimated' | 'external_dependency' | 'other'
    severity: 'low' | 'medium' | 'high'
    delayDays: number
    impactLevel: 'low' | 'medium' | 'high'
    description: string
    recommendation: string
}

export type SprintDelayReport = {
    sprintId?: number

    totalDelayedTasks: number
    totalDelayDays: number
    avgDelayDays: number

    impact: {
        overallImpact: 'low' | 'medium' | 'high'
        summary: string
    }

    mainCauses: {
        category: DelayReport['aiCategory']
        count: number
    }[]

    recommendations: string[]

    suggestedAdjustments: {
        suggestedEndDate: string | null
        notes: string
    }
}