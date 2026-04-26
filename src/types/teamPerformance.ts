import type { Task } from "./Task"

export interface TaskStatusSlice {
   name: string
   value: number
   fill: string
}

export interface TeamPerformanceRow {
   userId: number
   userName: string
   role: string
   tareasActivas: number
   completadasSprintActual: number
   promedioVariacion: number
   scoreProductividad: number
   tendencia: 'up' | 'down'
   cargaHoras: number
}

export interface MemberDetailKpis {
   tareasActivas: number
   completadasSprintActual: number
   promedioVariacion: number
   scoreProductividad: number
   tendencia: 'up' | 'down'
   cargaHoras: number
}

export interface MemberDetail {
   userId: number
   userName: string
   role: string
   kpis: MemberDetailKpis
   lastTasks: Task[]
   strengths: string[]
   sprintHistory: {
      sprintId: number
      sprintName: string
      completed: number
      total: number
   }[]
}
