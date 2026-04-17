/**
 * Shared types for Oracle Smart Productivity dashboard.
 * All entities use mock data only; no API shapes.
 */

export interface Sprint {
  id: number
  name: string
  startDate: string
  endDate: string
  projectId: number
}

export interface User {
  id: number
  name: string
  role: string
  avatar?: string
}

export interface Member {
  userId: number
  name: string
  role: string
}

export type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'closed'
export type TaskPriority = 'baja' | 'media' | 'alta'
export type TaskType = 'TASK' | 'BUG' | 'TRAINING'

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type?: TaskType

  sprintId: number
  assigneeId: number | null

  createdAt: string
  updatedAt?: string

  estimatedHours?: number
  actualHours: number
  isVisible: boolean
  featureId: number
}

export interface ActivityLogEntry {
  id: number
  userId: string
  userName: string
  action: string
  entityType: 'tarea' | 'sprint' | 'usuario' | 'sistema'
  entityId?: string
  /** Optional sprint context for filtering */
  sprintId?: string
  details?: string
  timestamp: string
}

export interface TeamMemberPerformance {
  userId: number
  userName: string
  role: string
  tasksCompleted: number
  tasksInProgress: number
  completionRate: number
  currentSprintContribution: number
}

/** Severity for "En Riesgo" panel items */
export type RiskSeverity = 'Alta' | 'Media' | 'Baja'

export interface OverdueTaskRisk {
  taskId: number
  title: string
  dueDate: string
  assigneeName: string
  severity: RiskSeverity
}

export interface OverloadedPersonRisk {
  userId: number
  userName: string
  currentTasks: number
  maxRecommended: number
  severity: RiskSeverity
}

export interface HighVarianceRisk {
  taskId: number
  title: string
  assigneeName: string
  estimatedHours: number
  actualHours: number
  varianceHours: number
  severity: RiskSeverity
}
