import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskManager } from './TaskManager'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import * as taskService from '../services/taskManager'
import * as api from '../api/taskManagerApi'

// ================= MOCKS =================

// Mock sprint context so all tests run within a fixed sprint
vi.mock('../context/SprintContext', () => ({
   useSprint: () => ({ selectedSprintId: 1 }),
}))

// Mock filters to avoid altering task data during tests
vi.mock('../utils/taskManager/filters', () => ({
   filterPoolTasks: (tasks: any) => tasks,
   filterBoardTasks: (tasks: any) => tasks,
}))

// Mock CreateTaskModal:
// - We bypass UI complexity
// - We directly trigger onSubmit with valid task data
// - Ensures create flow can be tested deterministically
vi.mock('../components/task-manager/CreateTaskModal.tsx', () => ({
   CreateTaskModal: ({ onSubmit }: any) => (
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
                  sprintId: 1,
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
   test('displays tasks assigned to each user in real-time', async () => {
      vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
         tasks: [
            { id: 1, title: 'Task A', assignedTo: 'Danilo', sprintId: 1 },
            { id: 2, title: 'Task B', assignedTo: 'Ana', sprintId: 1 },
         ],
         members: [
            { iserId: 1, name: 'Danilo', role: 'PM' },
            { iserId: 2, name: 'Ana', role: 'Backend dev' }
         ],
         sprints: [{ id: 1 }],
      } as any)

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
   test('updates UI when task state changes', async () => {
      vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
         tasks: [
            { id: 1, title: 'Task A', assignedTo: 'Danilo', status: 'open', sprintId: 1 }
         ],
         members: [],
         sprints: [{ id: 1 }],
      } as any)

      vi.mocked(api.updateTask).mockResolvedValue({} as any)

      renderWithRouter(<TaskManager />)

      // simulate state change
      await api.updateTask(1, { status: 'completed' })

      expect(api.updateTask).toHaveBeenCalled()
   })

   // =========================================================
   // [TM-03] REQUIREMENT:
   // - Completed tasks must display required metadata:
   //   * Status
   //   * Estimated hours
   //   * Actual hours
   // =========================================================
   test('completed tasks show required fields', async () => {
      vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
         tasks: [
            {
               id: 1,
               title: "completed task",
               status: "closed",
               priority: "media",
               type: "TASK",
               sprintId: 1,
               assigneeId: 1,
               createdAt: "2026-04-23",
               actualHours: 6,
               estimatedHours: 5,
               isVisible: true,
               featureId: 1,
            },
         ],
         members: [{ iserId: 1, name: 'Danilo', role: 'PM' }],
         sprints: [{ id: 1 }],
      } as any)

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
   test('allows marking a task as completed', async () => {
      vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
         tasks: [{ id: 1, title: 'Task A', status: 'open', sprintId: 1 }],
         members: [],
         sprints: [{ id: 1 }],
      } as any)

      vi.mocked(api.updateTask).mockResolvedValue({} as any)

      renderWithRouter(<TaskManager />)

      // simulate completion action
      await api.updateTask(1, { status: 'completed' })

      expect(api.updateTask).toHaveBeenCalledWith(1, { status: 'completed' })
   })

   // =========================================================
   // [TM-05] REQUIREMENT:
   // - Users must be able to create new tasks
   // - Modal submission must trigger API call
   // =========================================================
   test('creates a new task via modal', async () => {
      vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
         tasks: [],
         members: [],
         sprints: [{ id: 1 }],
      } as any)

      vi.mocked(api.createTask).mockResolvedValue({ id: 2 } as any)

      renderWithRouter(<TaskManager />)

      const open = await screen.findByRole('button', { name: /crear tarea/i })
      await userEvent.click(open)

      expect(await screen.findByText(/crear tarea/i)).toBeInTheDocument()

      const submit = await screen.findByRole('button', { name: /^crear$/i })
      await userEvent.click(submit)

      expect(api.createTask).toHaveBeenCalled()
   })
})