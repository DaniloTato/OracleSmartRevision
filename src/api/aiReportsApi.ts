import type { DelayReport } from "../types/DelayReport"

export async function fetchReports(): Promise<DelayReport[]> {
    const res = await fetch(`/api/overdue-reports`)
    const data = await res.json()

    return data.map((r: any) => ({
        id: r.id,
        taskTitle: r.taskTitle,
        developerName: r.developerName,
        dueDate: r.dueDate,
        submittedAt: r.submittedAt,
        reason: r.reason,
        aiSummary: r.aiSummary,
        aiCategory: r.aiCategory,
        severity: r.severity.toLowerCase(), // 👈 importante
        delayDays: r.delayDays,
        impactLevel: r.impactLevel.toLowerCase(),
        description: r.description,
        recommendation: r.recommendation,
    }))
}