import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { vi } from 'vitest'

// ================= MOCKS =================

vi.mock('../context/SprintContext', () => ({
   useSprint: () => ({ selectedSprintId: 1 }),
}))

const mockUseDashboardData = vi.fn()

vi.mock('../hooks/useDashboardData', () => ({
   useDashboardData: (...args: any[]) => mockUseDashboardData(...args),
}))

//we mock it so it only check if the params are being received correctly.
//due to chart contraints, it is not posible to test text inside it.
//The text is svg, and not part of the DOM.
vi.mock('../components/charts/GenericBarChart', () => ({
   GenericBarChart: ({ title, data }: any) => (
      <div data-testid="chart">
         <h3>{title}</h3>
         <pre>{JSON.stringify(data)}</pre>
      </div>
   ),
}))

// ================= TEST DATA =================

const mockData = {
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
   users: [
      { id: 1, name: 'Danilo', role: 'PM' },
      { id: 2, name: 'Ana', role: 'Backend Dev' },
   ],
   loading: false,
}

// ================= TESTS =================

describe('Dashboard', () => {
   beforeEach(() => {
      mockUseDashboardData.mockReturnValue(mockData)
   })

   // =========================================================
   // [D-01] REQUIREMENT: 
   // - Customized dashboard based on worker role
   // =========================================================
   test('[D-01] renders dashboard header', () => {
      render(<Dashboard />)
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
   })

   // =========================================================
   // [D-02] REQUIREMENT: KPIs 
   // - tasks completed per sprint
   // =========================================================
   test('[D-02] shows TEAM KPI values correctly (tasks completed + remaining)', () => {
      render(<Dashboard />)

      expect(screen.getByText('Tareas Completadas')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument() // 5 + 3
      expect(screen.getByText('Por Hacer')).toBeInTheDocument()
   })

   // =========================================================
   // [D-03] REQUIREMENT:
   // - Real-time display of tasks assigned to each user
   // - Sprint context visualization
   // =========================================================
   test('[D-03] renders sprint section with current sprint context', () => {
      render(<Dashboard />)

      expect(screen.getByText(/Sprint 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Progreso/i)).toBeInTheDocument()
   })

   // =========================================================
   // [D-04] REQUIREMENT:
   // - KPIs per PERSON per sprint
   // =========================================================
   test('[D-04] passes correct per-person task data to tasks chart', () => {
      render(<Dashboard />)

      const chart = screen.getAllByTestId('chart')[0]

      expect(chart).toBeInTheDocument()
      expect(chart.textContent).toContain('Danilo')
      expect(chart.textContent).toContain('Ana')
      expect(chart.textContent).toContain('5')
      expect(chart.textContent).toContain('3')
   })

   // =========================================================
   // [D-05] REQUIREMENT:
   // - Hours worked per PERSON per sprint
   // =========================================================
   test('[D-05] passes correct per-person hours data to hours chart', () => {
      render(<Dashboard />)

      const charts = screen.getAllByTestId('chart')

      expect(charts[1]).toBeInTheDocument()
      expect(charts[1].textContent).toContain('Horas reales por integrante')
      expect(charts[1].textContent).toContain('20')
   })

   // =========================================================
   // [D-06] REQUIREMENT:
   // - System must handle loading states properly
   // =========================================================
   test('[D-06] shows loading state', () => {
      mockUseDashboardData.mockReturnValueOnce({
         ...mockData,
         loading: true,
      })

      render(<Dashboard />)

      expect(screen.getByText(/cargando dashboard/i)).toBeInTheDocument()
   })
})