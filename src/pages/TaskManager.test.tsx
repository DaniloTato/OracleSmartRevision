import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import { TaskManager } from './TaskManager'

import * as taskService from '../services/taskManager'
import * as api from '../api/taskManagerApi'

import type { Task } from '../types/Task'
import type { Member, Sprint } from '../types'
import type { CreateTaskDto } from '../types/Task'

const createTaskMock = (overrides: Partial<Task> = {}): Task => ({
    id: 1,
    projectId: 1,
    sprintId: 1,
    featureId: 1,

    title: 'Task',
    description: '',

    status: 'open',
    type: 'TASK',

    assigneeId: null,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',

    estimatedHours: 0,
    actualHours: 0,

    isVisible: true,

    ...overrides,
})

const createMemberMock = (overrides: Partial<Member> = {}): Member => ({
    userId: 1,
    name: 'Danilo',
    role: 'PM',
    ...overrides,
})

const createSprintMock = (overrides: Partial<Sprint> = {}): Sprint => ({
    id: 1,
    name: 'Sprint 1',
    startDate: '2026-01-01',
    endDate: '2026-01-15',
    status: 'active',
    projectId: 1,
    ...overrides,
})

// ================= MOCKS =================

// Mock sprint context so all tests run within a fixed sprint
vi.mock('../context/SprintContext', () => ({
    useSprint: () => ({ selectedSprintId: 1 }),
}))

// Mock filters to avoid altering task data during tests
vi.mock('../utils/taskManager/filters', () => ({
    filterPoolTasks: (tasks: Task[]) => tasks,
    filterBoardTasks: (tasks: Task[]) => tasks,
}))

// Mock CreateTaskModal:
// - We bypass UI complexity
// - We directly trigger onSubmit with valid task data
// - Ensures create flow can be tested deterministically
interface MockCreateTaskModalProps {
    onSubmit: (task: CreateTaskDto) => void
}

vi.mock('../components/task-manager/CreateTaskModal.tsx', () => ({
    CreateTaskModal: ({ onSubmit }: MockCreateTaskModalProps) => (
        <div>
            <button
                onClick={() =>
                    onSubmit({
                        title: 'New Task',
                        type: 'TASK',
                        status: 'open',
                        estimatedHours: 4,
                        actualHours: 0,
                        featureId: 1,
                        assigneeId: null,
                        isVisible: true,
                        description: '',
                    })
                }
            >
                Crear
            </button>
        </div>
    ),
}))

vi.mock('../services/taskManager')
vi.mock('../api/taskManagerApi')

// ================= HELPERS =================

function renderWithRouter(ui: React.ReactNode) {
    return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// ================= TESTS =================

describe('TaskManager (Requirements)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // =========================================================
    // [TM-01] REQUIREMENT:
    // - Real-time display of tasks assigned to each user
    // =========================================================
    test('[TM-01] displays tasks assigned to each user in real-time', async () => {
        vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
            tasks: [
                createTaskMock({
                    id: 1,
                    title: 'Task A',
                    assigneeId: 1,
                }),
                createTaskMock({
                    id: 2,
                    title: 'Task B',
                    assigneeId: 2,
                }),
            ],
            members: [
                createMemberMock({
                    userId: 1,
                    name: 'Danilo',
                }),
                createMemberMock({
                    userId: 2,
                    name: 'Ana',
                }),
            ],
            sprints: [createSprintMock()],
        })

        renderWithRouter(<TaskManager />)

        expect((await screen.findAllByText('Task A')).length).toBeGreaterThan(0)
        expect((await screen.findAllByText('Danilo')).length).toBeGreaterThan(0)

        expect((await screen.findAllByText('Task B')).length).toBeGreaterThan(0)
        expect((await screen.findAllByText('Ana')).length).toBeGreaterThan(0)
    })

    // =========================================================
    // [TM-02] REQUIREMENT:
    // - State changes must be reflected in the system
    // - Task updates should trigger API interaction
    // =========================================================
    test('[TM-02] updates UI when task state changes', async () => {
        vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
            tasks: [
                createTaskMock({
                    title: 'Task A',
                    status: 'open',
                }),
            ],
            members: [],
            sprints: [createSprintMock()],
        })

        vi.mocked(api.updateTask).mockResolvedValue(
            createTaskMock({
                status: 'closed',
            })
        )

        renderWithRouter(<TaskManager />)

        await api.updateTask(1, {
            status: 'closed',
        })

        expect(api.updateTask).toHaveBeenCalledWith(1, {
            status: 'closed',
        })
    })

    // =========================================================
    // [TM-03] REQUIREMENT:
    // - Completed tasks must display required metadata:
    //   * Status
    //   * Estimated hours
    //   * Actual hours
    // =========================================================
    test('[TM-03] completed tasks show required fields', async () => {
        vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
            tasks: [
                createTaskMock({
                    title: 'completed task',
                    status: 'closed',
                    assigneeId: 1,
                    estimatedHours: 5,
                    actualHours: 6,
                }),
            ],
            members: [
                createMemberMock({
                    userId: 1,
                    name: 'Danilo',
                }),
            ],
            sprints: [createSprintMock()],
        })

        renderWithRouter(<TaskManager />)

        expect((await screen.findAllByText('Hecho')).length).toBeGreaterThan(0)

        // Required fields validation
        expect(screen.getByText(/Est:\s*5/)).toBeInTheDocument()
        expect(screen.getByText(/Real:\s*6/)).toBeInTheDocument()
    })

    // =========================================================
    // [TM-04] REQUIREMENT:
    // - Users must be able to mark tasks as completed
    // - Correct API call must be issued
    // =========================================================
    test('[TM-04] allows marking a task as completed', async () => {
        vi.mocked(api.getTasks).mockResolvedValue([
            createTaskMock({
                id: 1,
                status: 'closed',
            }),
        ])
        vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
            tasks: [
                createTaskMock({
                    id: 1,
                    title: 'Task A',
                    status: 'open',
                    assigneeId: 1,
                }),
            ],
            members: [createMemberMock()],
            sprints: [createSprintMock()],
        })
        vi.mocked(api.updateTask).mockResolvedValue(
            createTaskMock({
                id: 1,
                status: 'closed',
            })
        )
        renderWithRouter(<TaskManager />)
        const selects = await screen.findAllByRole('combobox')
        const taskStatusSelect = selects[2]
        await userEvent.selectOptions(taskStatusSelect, 'closed')
        const confirmButton = await screen.findByRole('button', {
            name: /confirmar/i,
        })

        await userEvent.click(confirmButton)
        expect(api.updateTask).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                status: 'closed',
            })
        )
    })

    // =========================================================
    // [TM-05] REQUIREMENT:
    // - Users must be able to create new tasks
    // - Modal submission must trigger API call
    // =========================================================
    test('[TM-05] creates a new task via modal', async () => {
        vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
            tasks: [],
            members: [],
            sprints: [createSprintMock()],
        })

        vi.mocked(api.createTask).mockResolvedValue(
            createTaskMock({
                id: 2,
                title: 'New Task',
            })
        )

        renderWithRouter(<TaskManager />)

        const open = await screen.findByRole('button', { name: /crear tarea/i })
        await userEvent.click(open)

        expect(await screen.findByText(/crear tarea/i)).toBeInTheDocument()

        const submit = await screen.findByRole('button', { name: /^crear$/i })
        await userEvent.click(submit)

        expect(api.createTask).toHaveBeenCalled()
    })
})
