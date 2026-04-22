import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { vi } from 'vitest'

vi.mock('../context/SprintContext', () => ({
   useSprint: () => ({ selectedSprintId: 1 }),
}))

vi.mock('../hooks/useDashboardData', () => ({
   useDashboardData: () => ({
      sprints: [
         {
            id: 1,
            name: 'Sprint 1',
            startDate: '2024-01-01',
            endDate: '2024-01-10',
         },
      ],
      summary: { totalTasks: 10 },
      tasks: [
         { user: 'Danilo', tasksCompleted: 5 },
         { user: 'Ana', tasksCompleted: 3 },
      ],
      hours: [{ userId: 1, actualHours: 20 }],
      users: [{ id: 1, name: 'Danilo' }],
      loading: false,
   }),
}))

describe('Dashboard', () => {
   test('renders dashboard title', () => {
      render(<Dashboard />)
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
   })

   test('shows KPI completed tasks correctly', () => {
      render(<Dashboard />)
      expect(screen.getByText('8')).toBeInTheDocument()
   })

   test('shows remaining tasks correctly', () => {
      render(<Dashboard />)
      expect(screen.getByText('2')).toBeInTheDocument()
   })

   test('matches snapshot', () => {
      const { asFragment } = render(<Dashboard />)
      expect(asFragment()).toMatchSnapshot()
   })
})
