import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env.API_BASE_URL = 'http://localhost:8080'
process.env.SERVICE_API_TOKEN = 'fake-token'

vi.mock('../src/apiClient.js', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
    },
}))

import { apiClient } from '../src/apiClient.js'
import { createCommands } from '../src/commands.js'

describe('Telegram Bot Commands', () => {
    let reply
    let commands
    let userState

    beforeEach(() => {
        vi.clearAllMocks()

        reply = vi.fn()
        userState = {}

        commands = createCommands({
            reply,
            BASE_URL: 'http://localhost:8080',
            AI_BASE_URL: 'http://localhost:5000',
            PROJECT_ID: 1,
            SPRINT_ID: 3,
            DEFAULT_ASSIGNEE_ID: 105,
            userState,
        })
    })

    it('[B-01] should create a task and confirm message', async () => {
        apiClient.post.mockResolvedValue({})

        const msg = {
            chat: { id: 123 },
            text: 'Nueva tarea de testing',
        }

        await commands.handleCreatingTask(msg)

        expect(apiClient.post).toHaveBeenCalledWith(
            'http://localhost:8080/projects/1/issues',
            expect.objectContaining({
                title: 'Nueva tarea de testing',
                assigneeId: 105,
                type: 'BUG',
            })
        )

        expect(reply).toHaveBeenCalledWith(123, 'Tarea creada')
        expect(userState[123]).toBeUndefined()
    })

    it('[B-02] should list only closed tasks in sprint', async () => {
        apiClient.get.mockResolvedValue({
            data: [
                { id: 1, title: 'Fix Login', status: 'closed' },
                { id: 2, title: 'Dashboard', status: 'closed' },
                { id: 3, title: 'Task Pending', status: 'open' },
            ],
        })

        const msg = { chat: { id: 123 } }

        await commands.list_completed(msg, ['3'])

        expect(apiClient.get).toHaveBeenCalledWith(
            'http://localhost:8080/projects/1/issues',
            {
                params: { sprintId: '3' },
            }
        )

        const output = reply.mock.calls[0][1]

        expect(output).toContain('#1 - Fix Login')
        expect(output).toContain('#2 - Dashboard')
        expect(output).not.toContain('Task Pending')
    })

    it('[B-03] should filter by sprint and user', async () => {
        apiClient.get.mockResolvedValue({
            data: [
                { id: 10, title: 'API Refactor', status: 'closed' },
                { id: 11, title: 'Testing', status: 'closed' },
                { id: 12, title: 'Pending', status: 'open' },
            ],
        })

        const msg = { chat: { id: 123 } }

        await commands.list_completed(msg, ['3', '101'])

        expect(apiClient.get).toHaveBeenCalledWith(
            'http://localhost:8080/projects/1/issues',
            {
                params: {
                    sprintId: '3',
                    assignedTo: '101',
                },
            }
        )

        const output = reply.mock.calls[0][1]

        expect(output).toContain('#10 - API Refactor')
        expect(output).toContain('#11 - Testing')
        expect(output).not.toContain('Pending')
    })

    it('should handle empty completed tasks', async () => {
        apiClient.get.mockResolvedValue({ data: [] })

        const msg = { chat: { id: 123 } }

        await commands.list_completed(msg, ['3'])

        const output = reply.mock.calls[0][1]

        expect(output).toContain('Tareas completas')
        expect(output).not.toContain('#')
    })

    it('should show usage when args are invalid', async () => {
        const msg = { chat: { id: 123 } }

        await commands.list_completed(msg, [])

        expect(reply).toHaveBeenCalledWith(
            123,
            'Uso correcto: /list_completed [sprintId] [userId]'
        )
    })
})
