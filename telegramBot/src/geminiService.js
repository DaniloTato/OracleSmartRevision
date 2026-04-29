import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
})

/**
 * simple sleep util
 */
const sleep = (ms) => new Promise(res => setTimeout(res, ms))

/**
 * check if error is retryable
 */
function isRetryableError(err) {
    return (
        err?.status === 429 ||
        err?.status === 503 ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT'
    )
}

/**
 * strict JSON extraction (no regex hack)
 */
function safeParseJSON(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Empty AI response')
    }
    // remove markdown fences
    const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
    // extract first valid JSON block (safer than full parse)
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) {
        throw new Error(`No JSON object found in: ${text}`)
    }
    try {
        return JSON.parse(match[0])
    } catch (e) {
        throw new Error(`Invalid JSON from Gemini: ${text}`)
    }
}

/**
 * main function
 */
export async function analyzeDelay(
    { taskTitle, reason, delayDays },
    retries = 3
) {
    const prompt = `
    You are a strict JSON API.
    OUTPUT RULES:
    - Output ONLY raw JSON
    - NO markdown
    - NO backticks
    - NO explanation
    - MUST match schema exactly
    Return a DelayReport object with this schema:
    {
    "aiSummary": string,
    "aiCategory": "blocked" | "underestimated" | "external_dependency" | "other",
    "severity": "low" | "medium" | "high",
    "delayDays": number,
    "impactLevel": "low" | "medium" | "high",
    "description": string,
    "recommendation": string
    }
    Context (do NOT repeat verbatim):
    - Task: ${taskTitle}
    - Reason for delay: ${reason}
    - Delay days: ${delayDays}
    Rules:
    - aiCategory must be inferred from reason:
    - blocked → internal blocker
    - external_dependency → external team/API/vendor
    - underestimated → planning mistake
    - other → anything else
    - aiSummary must be 1–2 sentences
    - description must explain technical/business impact clearly
    - recommendation must be actionable
    - aiCategory MUST be exactly one of: "blocked", "underestimated", "external_dependency", "other"
    - Do NOT invent new categories
    - "aiSummary", "description" and "recommendation" information must be in Spanish.
    Return ONLY valid JSON.
    `.trim()

    let lastError

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const result = await model.generateContent(prompt)
            const text = result.response.text()
            console.log(text)
            const parsed = safeParseJSON(text)
            const validated = validateAI(parsed)
            return validated
        } catch (err) {
            lastError = err

            console.error(`[Gemini attempt ${attempt + 1}]`, {
                message: err.message,
                status: err?.status,
                code: err?.code,
            })

            const isRetryable = isRetryableError(err) || err.message.includes('Invalid JSON')

            if (!isRetryable || attempt === retries - 1) {
                break
            }

            const delay = 1000 * Math.pow(2, attempt) // exponential backoff
            await sleep(delay)
        }
    }

    throw new Error(
        lastError?.message || 'Gemini failed after retries'
    )
}

function validateAI(obj) {

    if (!obj || typeof obj !== 'object') {
        throw new Error('AI returned non-object')
    }

    const requiredString = (key) => {
        if (typeof obj[key] !== 'string' || !obj[key].trim()) {
            throw new Error(`Missing or invalid field: ${key}`)
        }

    }

    requiredString('aiSummary')
    requiredString('aiCategory')
    requiredString('severity')
    requiredString('recommendation')
    requiredString('description')

    obj.delayDays = Number(obj.delayDays)

    if (Number.isNaN(obj.delayDays)) {
        throw new Error('Invalid delayDays')
    }

    const allowedCategories = [
        'blocked',
        'underestimated',
        'external_dependency',
        'other'
    ]

    const allowedSeverity = ['low', 'medium', 'high']
    const allowedImpact = ['low', 'medium', 'high']

    const impactLevel = obj.impactLevel || obj.impact?.impactLevel || 'medium'

    if (!allowedCategories.includes(obj.aiCategory)) {
        throw new Error('Invalid aiCategory')
    }

    if (!allowedSeverity.includes(obj.severity)) {
        throw new Error('Invalid severity')
    }

    if (!allowedImpact.includes(impactLevel)) {
        throw new Error('Invalid impact level')
    }

    obj.impactLevel = impactLevel

    return obj

}