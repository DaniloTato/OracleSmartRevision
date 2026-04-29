import axios from 'axios'

const API_BASE_URL = process.env.API_BASE_URL
const AI_BASE_URL = process.env.AI_BASE_URL

export async function processOverdueTask(task, config, reason) {
    const { apiUrl, aiUrl } = config

    const ai = await callAI(task, reason, aiUrl)

    const delayReport = buildDelayReport({
        task,
        reason,
        ai,
    })

    await axios.post(`${apiUrl}/overdue-reports`, delayReport)
}

/**
 * Normalize AI output + map to backend schema
 */
function buildDelayReport({ task, reason, ai }) {
    const delayDays = calculateDelay(task)
    console.log('TASK DEBUG:', task.dueDate)
    return {
        issueId: task.id,
        taskTitle: task.title,
        developerName: task.assigneeId.toString() || 'unknown',
        dueDate: task.dueDate,
        reason,
        aiSummary: ai.aiSummary || '',
        aiCategory: normalizeCategory(ai.aiCategory),
        severity: normalizeSeverity(ai.severity),
        delayDays,
        impactLevel: normalizeImpact(ai.impactLevel),
        description: ai.description || '',
        recommendation: ai.recommendation || '',
    }
}

/**
 * AI may return uppercase → normalize safely
 */
function normalizeSeverity(value) {
    const v = (value || '').toLowerCase()

    if (v === 'high') return 'high'
    if (v === 'medium') return 'medium'
    if (v === 'low') return 'low'

    return 'medium'
}

function normalizeImpact(value) {
    const v = (value || '').toLowerCase()

    if (v === 'high') return 'high'
    if (v === 'medium') return 'medium'
    if (v === 'low') return 'low'

    return 'medium'
}

function normalizeCategory(value) {
    const v = (value || '').toLowerCase()

    if (['blocked', 'underestimated', 'external_dependency', 'other'].includes(v)) {
        return v
    }

    return 'other'
}

function calculateDelay(task) {
    if (!task.dueDate) return 0

    const diff = Date.now() - new Date(task.dueDate).getTime()

    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/**
 * AI call (unchanged)
 */
async function callAI(task, reason, aiUrl) {
    const delayDays = calculateDelay(task)

    const { data } = await axios.post(`${aiUrl}/ai/analyze-delay`, {
        taskTitle: task.title,
        reason,
        delayDays,
    })

    return data
}