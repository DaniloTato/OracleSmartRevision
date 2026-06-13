export interface UserCredentials {
    email: string
    password: string
    name: string
    roleId: RoleId
}

export interface LoginResponse {
    token: string
    userId: number
    email: string
    name: string
    roleId: number
}

export type RoleId = 1 | 2 // 1 = Manager, 2 = Developer

export type TaskStatus = 'open' | 'in_progress' | 'closed'
export type TaskType = 'TASK' | 'BUG' | 'TRAINING'

export interface Task {
    id: number
    projectId: number
    sprintId: number
    featureId: number
    title: string
    description?: string
    status: TaskStatus
    type: TaskType
    assigneeId: number | null
    createdAt: string
    updatedAt: string
    estimatedHours?: number
    actualHours: number
    isVisible: boolean
    dueDate?: string
}

export interface CreateTaskPayload {
    title: string
    description?: string
    type: TaskType
    status: TaskStatus
    estimatedHours: number
    actualHours: number
    featureId: number
    assigneeId: number | null
    isVisible: boolean
    dueDate?: string
}

export interface KpiSummary {
    totalTasks: number
}

export interface TasksByUser {
    user: string
    tasksCompleted: number
}

export interface HoursByUser {
    userId: number
    user: string
    hours: number
}

export interface Sprint {
    id: number
    name: string
}

export interface Member {
    userId: number
    name: string
    email: string
}

export interface Feature {
    id: number
    title: string
    sprintId: number
}

export type DelaySeverity = 'low' | 'medium' | 'high'
export type DelayCategory =
    | 'technical_debt'
    | 'scope_creep'
    | 'blocked'
    | 'underestimation'
    | 'personal'

export interface DelayReport {
    id: number
    taskTitle: string
    developerName: string
    dueDate: string
    severity: DelaySeverity
    delayDays: number
    aiSummary: string
    description: string
    recommendation: string
    reason: string
    aiCategory: DelayCategory
    submittedAt: string
}

export const BASE_URL = 'http://localhost:5173'

export const ROUTES = {
    login: '/login',
    dashboard: '/dashboard',
    tasks: '/task-manager',
    reports: '/ai-reports',
} as const

export const API_BASE = '/api'

export const API_ROUTES = {
    login: `${API_BASE}/auth/login`,
    projectSprints: (pid: number) => `${API_BASE}/projects/${pid}/sprints`,
    projectMembers: (pid: number) => `${API_BASE}/projects/${pid}/members`,
    projectIssues: (pid: number) => `${API_BASE}/projects/${pid}/issues`,
    sprintFeatures: (sid: number) => `${API_BASE}/sprints/${sid}/features`,
    issue: (id: number) => `${API_BASE}/issues/${id}`,
    kpiSummary: (pid: number, sid: number) =>
        `${API_BASE}/projects/${pid}/kpis/summary?sprintId=${sid}`,
    tasksByUser: (pid: number) =>
        `${API_BASE}/projects/${pid}/kpis/tasks-by-user`,
    tasksByUserSprint: (pid: number, sid: number) =>
        `${API_BASE}/projects/${pid}/kpis/tasks-by-user?sprintId=${sid}`,
    hoursByUser: (pid: number, sid: number) =>
        `${API_BASE}/projects/${pid}/kpis/hours-by-user?sprintId=${sid}`,
    realHoursByUser: (pid: number, sid: number) =>
        `${API_BASE}/projects/${pid}/kpis/real-hours-by-user?sprintId=${sid}`,
    users: `${API_BASE}/users`,
    reports: `${API_BASE}/ai-reports`,
    vectorReindex: `${API_BASE}/vector/reindex`,
} as const

export const USERS: Record<
    'manager' | 'developer' | 'invalid',
    UserCredentials
> = {
    manager: {
        email: 'manager@oracle.com',
        password: 'Manager123!',
        name: 'Ana García',
        roleId: 1,
    },
    developer: {
        email: 'dev@oracle.com',
        password: 'Dev123!',
        name: 'Carlos López',
        roleId: 2,
    },
    invalid: {
        email: 'nobody@oracle.com',
        password: 'wrongpassword',
        name: '',
        roleId: 2,
    },
}

export const PROJECT_ID = 1

export const MOCK_SPRINTS: Sprint[] = [
    { id: 1, name: 'Sprint 1' },
    { id: 2, name: 'Sprint 2' },
    { id: 3, name: 'Sprint 3' },
]

export const MOCK_MEMBERS: Member[] = [
    { userId: 10, name: 'Carlos López', email: 'dev@oracle.com' },
    { userId: 11, name: 'María Martínez', email: 'maria@oracle.com' },
    { userId: 12, name: 'Pedro Ruiz', email: 'pedro@oracle.com' },
]

export const MOCK_FEATURES: Feature[] = [
    { id: 100, title: 'Authentication Module', sprintId: 1 },
    { id: 101, title: 'Dashboard Analytics', sprintId: 1 },
    { id: 102, title: 'Task Management', sprintId: 2 },
]

export function makeMockTask(overrides: Partial<Task> = {}): Task {
    return {
        id: Math.floor(Math.random() * 9000) + 1000,
        projectId: PROJECT_ID,
        sprintId: 1,
        featureId: 100,
        title: 'Sample Task',
        description: 'A sample task for testing',
        status: 'open',
        type: 'TASK',
        assigneeId: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedHours: 4,
        actualHours: 0,
        isVisible: true,
        ...overrides,
    }
}

export const MOCK_TASKS: Task[] = [
    makeMockTask({
        id: 1001,
        title: 'Implement login flow',
        status: 'closed',
        assigneeId: 10,
        estimatedHours: 8,
        actualHours: 7,
    }),
    makeMockTask({
        id: 1002,
        title: 'Design dashboard UI',
        status: 'in_progress',
        assigneeId: 11,
        estimatedHours: 6,
        actualHours: 3,
    }),
    makeMockTask({
        id: 1003,
        title: 'Fix navigation bug',
        status: 'open',
        assigneeId: 10,
        type: 'BUG',
        estimatedHours: 2,
        actualHours: 0,
    }),
    makeMockTask({
        id: 1004,
        title: 'Write unit tests',
        status: 'open',
        assigneeId: 12,
        estimatedHours: 4,
        actualHours: 0,
    }),
    makeMockTask({
        id: 1005,
        title: 'Onboarding training session',
        status: 'in_progress',
        assigneeId: 11,
        type: 'TRAINING',
        estimatedHours: 3,
        actualHours: 1,
    }),
]

export const MOCK_TASKS_BY_USER: TasksByUser[] = [
    { user: 'Carlos López', tasksCompleted: 12 },
    { user: 'María Martínez', tasksCompleted: 9 },
    { user: 'Pedro Ruiz', tasksCompleted: 7 },
]

export const MOCK_HOURS_BY_USER: HoursByUser[] = [
    { userId: 10, user: 'Carlos López', hours: 48 },
    { userId: 11, user: 'María Martínez', hours: 36 },
    { userId: 12, user: 'Pedro Ruiz', hours: 28 },
]

export const MOCK_KPI_SUMMARY: KpiSummary = {
    totalTasks: 28,
}

export const MOCK_DELAY_REPORTS: DelayReport[] = [
    {
        id: 1,
        taskTitle: 'Implement login flow',
        developerName: 'Carlos López',
        dueDate: '2024-12-01T00:00:00.000Z',
        severity: 'high',
        delayDays: 5,
        aiSummary:
            'Task was delayed due to unexpected technical complexity in the OAuth integration.',
        description: 'Delay impacts sprint velocity by 18%.',
        recommendation:
            'Break down OAuth tasks into smaller subtasks in future sprints.',
        reason: 'The OAuth library had breaking changes in the latest version.',
        aiCategory: 'technical_debt',
        submittedAt: '2024-12-06T10:00:00.000Z',
    },
    {
        id: 2,
        taskTitle: 'Design dashboard UI',
        developerName: 'María Martínez',
        dueDate: '2024-12-03T00:00:00.000Z',
        severity: 'medium',
        delayDays: 2,
        aiSummary:
            'Design iteration took longer due to multiple stakeholder revision rounds.',
        description: 'Minor impact on overall sprint timeline.',
        recommendation:
            'Establish design approval checkpoints earlier in the sprint.',
        reason: 'Required three rounds of feedback from product team.',
        aiCategory: 'scope_creep',
        submittedAt: '2024-12-05T09:30:00.000Z',
    },
]

export const MOCK_LOGIN_RESPONSE = (user: UserCredentials): LoginResponse => ({
    token: 'mock-jwt-token-xyz-123',
    userId: user.roleId === 1 ? 1 : 10,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
})

export interface TaskCreationFixture {
    label: string
    title: string
    type: TaskType
    estimatedHours: number
    assigneeName: string | null
    expectedStatus: TaskStatus
}

export const TASK_CREATION_FIXTURES: TaskCreationFixture[] = [
    {
        label: 'Bug with assignee',
        title: 'Fix critical login redirect bug',
        type: 'BUG',
        estimatedHours: 3,
        assigneeName: 'Carlos López',
        expectedStatus: 'open',
    },
    {
        label: 'Training unassigned',
        title: 'Playwright E2E workshop preparation',
        type: 'TRAINING',
        estimatedHours: 8,
        assigneeName: null,
        expectedStatus: 'open',
    },
    {
        label: 'Task with long estimate',
        title: 'Refactor authentication service layer',
        type: 'TASK',
        estimatedHours: 16,
        assigneeName: 'María Martínez',
        expectedStatus: 'open',
    },
]

export interface StatusChangeFixture {
    taskId: number
    taskTitle: string
    newStatus: TaskStatus
    label: string
}

export const STATUS_CHANGE_FIXTURES: StatusChangeFixture[] = [
    {
        taskId: 1002,
        taskTitle: 'Design dashboard UI',
        newStatus: 'closed',
        label: 'Mark as completed',
    },
    {
        taskId: 1003,
        taskTitle: 'Fix navigation bug',
        newStatus: 'in_progress',
        label: 'Mark as in progress',
    },
    {
        taskId: 1004,
        taskTitle: 'Write unit tests',
        newStatus: 'in_progress',
        label: 'Move to in progress',
    },
]
