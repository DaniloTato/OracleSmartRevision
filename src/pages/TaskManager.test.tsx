import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskManager } from './TaskManager'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import * as taskService from '../services/taskManager'
import * as api from '../api/taskManagerApi'

vi.mock('../context/SprintContext', () => ({
  useSprint: () => ({ selectedSprintId: 1 }),
}))

vi.mock('../services/taskManager')
vi.mock('../api/taskManagerApi')

function renderWithRouter(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  )
}

describe('TaskManager', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows loading state initially', () => {
    vi.mocked(taskService.loadTaskManagerData)
      .mockReturnValue(new Promise(() => {}))

    renderWithRouter(<TaskManager />)

    expect(screen.getByText(/cargando tareas/i)).toBeInTheDocument()
  })

  test('renders tasks after loading', async () => {
    vi.mocked(taskService.loadTaskManagerData).mockResolvedValue({
      tasks: [
        {
          id: 1,
          title: 'Test Task',
          status: 'open',
          type: 'TASK',
          priority: 'alta',
          sprintId: 1,
          assignedTo: null,
        },
      ],
      members: [],
      sprints: [{ id: 1, name: 'Sprint 1' }],
    } as any)

    renderWithRouter(<TaskManager />)

    expect(await screen.findByText('Test Task')).toBeInTheDocument()
  })

  test('opens create task modal when clicking button', async () => {
    vi.mocked(taskService.loadTaskManagerData)
      .mockResolvedValue({
        tasks: [],
        members: [],
        sprints: [],
      } as any)

    renderWithRouter(<TaskManager />)

    const button = await screen.findByRole('button', { name: /crear tarea/i })

    await userEvent.click(button)

    expect(screen.getAllByText(/crear tarea/i).length).toBeGreaterThan(1)
  })

  test('calls createTask API (mock ready)', async () => {
    vi.mocked(taskService.loadTaskManagerData)
      .mockResolvedValue({
        tasks: [],
        members: [],
        sprints: [{ id: 1 }],
      } as any)

    vi.mocked(api.createTask).mockResolvedValue({ id: 2 } as any)

    renderWithRouter(<TaskManager />)

    const button = await screen.findByRole('button', { name: /crear tarea/i })
    await userEvent.click(button)

    expect(api.createTask).not.toHaveBeenCalled()
  })

})