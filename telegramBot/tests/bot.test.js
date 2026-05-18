import { describe, it, expect, vi, beforeEach } from 'vitest'

import axios from 'axios'

import { createCommands } from '../src/commands.js'

vi.mock('axios')

describe('Telegram Bot Commands', () => {
    let reply
    let commands
    let userState

    beforeEach(() => {
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

    it('debe crear una tarea [B-01]', async () => {
        axios.post.mockResolvedValue({})

        const msg = {
            chat: {
                id: 123,
            },
            text: 'Nueva tarea de testing',
        }

        await commands.handleCreatingTask(msg)

        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:8080/projects/1/issues',
            {
                title: 'Nueva tarea de testing',
                description: '',
                type: 'BUG',
                status: 'closed',
                estimatedHours: 0,
                actualHours: 0,
                featureId: 2,
                assigneeId: 105,
                isVisible: true,
            }
        )

        expect(reply).toHaveBeenCalledWith(123, 'Tarea creada')
    })

    it('debe mostrar tareas completadas de un sprint [B-02]', async () => {
        axios.get.mockResolvedValue({
            data: [
                {
                    id: 1,
                    title: 'Fix Login',
                    status: 'closed',
                },
                {
                    id: 2,
                    title: 'Dashboard',
                    status: 'closed',
                },
                {
                    id: 3,
                    title: 'Task Pending',
                    status: 'open',
                },
            ],
        })

        const msg = {
            chat: {
                id: 123,
            },
        }

        await commands.list_completed(msg, ['3'])

        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:8080/projects/1/issues',
            {
                params: {
                    sprintId: '3',
                },
            }
        )

        expect(reply).toHaveBeenCalledWith(
            123,
            'Tareas completas en sprint-id 3:\n\n#1 - Fix Login\n#2 - Dashboard'
        )
    })

    it('debe mostrar tareas completadas de usuario en sprint [B-03]', async () => {
        axios.get.mockResolvedValue({
            data: [
                {
                    id: 10,
                    title: 'API Refactor',
                    status: 'closed',
                },
                {
                    id: 11,
                    title: 'Testing',
                    status: 'closed',
                },
                {
                    id: 12,
                    title: 'Pending',
                    status: 'open',
                },
            ],
        })

        const msg = {
            chat: {
                id: 123,
            },
        }

        await commands.list_completed(msg, ['3', '101'])

        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:8080/projects/1/issues',
            {
                params: {
                    sprintId: '3',
                    assignedTo: '101',
                },
            }
        )

        expect(reply).toHaveBeenCalledWith(
            123,
            'Tareas completas en sprint-id 3:\n\n#10 - API Refactor\n#11 - Testing'
        )
    })
})
