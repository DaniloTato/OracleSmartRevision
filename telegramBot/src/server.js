import express from 'express'

import { analyzeDelay } from './geminiService.js'

const app = express()

app.use(express.json())

function isRetryableError(err) {

    return (

        err?.status === 503 ||

        err?.status === 429 ||

        err?.code === 'ECONNRESET' ||

        err?.code === 'ETIMEDOUT'

    )

}

app.post('/ai/analyze-delay', async (req, res) => {
    try {
        const data = await analyzeDelay(req.body)
        return res.json(data)

    } catch (err) {
        console.error('[AI ERROR]', {
            message: err.message,
            status: err.status,
            code: err.code,
        })

        if (isRetryableError(err)) {

            return res.status(503).json({

                error: 'AI temporarily unavailable',

                retryable: true,

            })
        }

        if (err instanceof SyntaxError) {

            return res.status(422).json({

                error: 'AI returned invalid JSON',

                retryable: false,

            })
        }

        return res.status(500).json({
            error: 'Unexpected AI failure',
            retryable: false,
        })
    }
})

app.listen(3001, () => {
    console.log('AI server running on port 3001')
})