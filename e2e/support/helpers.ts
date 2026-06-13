import { type Page, type Route, expect } from '@playwright/test'
import type {
    UserCredentials,
    Task,
    Sprint,
    Member,
    Feature,
    TasksByUser,
    HoursByUser,
    KpiSummary,
    DelayReport,
    LoginResponse,
} from './types'
import {
    API_ROUTES,
    PROJECT_ID,
    MOCK_SPRINTS,
    MOCK_MEMBERS,
    MOCK_FEATURES,
    MOCK_TASKS,
    MOCK_TASKS_BY_USER,
    MOCK_HOURS_BY_USER,
    MOCK_KPI_SUMMARY,
    MOCK_DELAY_REPORTS,
    MOCK_LOGIN_RESPONSE,
    ROUTES,
} from './types'

export async function mockLoginSuccess(
    page: Page,
    user: UserCredentials
): Promise<void> {
    await page.route(`**${API_ROUTES.login}`, async (route: Route) => {
        const body: LoginResponse = MOCK_LOGIN_RESPONSE(user)
        await route.fulfill({
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
    })
}

export async function mockLoginFailure(page: Page): Promise<void> {
    await page.route(`**${API_ROUTES.login}`, async (route: Route) => {
        await route.fulfill({
            status: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Invalid email or password.' }),
        })
    })
}

export async function mockTaskManagerAPIs(
    page: Page,
    opts: {
        tasks?: Task[]
        members?: Member[]
        sprints?: Sprint[]
        features?: Feature[]
    } = {}
): Promise<void> {
    let tasks = [...(opts.tasks ?? MOCK_TASKS)]
    const members = opts.members ?? MOCK_MEMBERS
    const sprints = opts.sprints ?? MOCK_SPRINTS
    const features = opts.features ?? MOCK_FEATURES

    // Sprints
    await page.route(
        `**${API_ROUTES.projectSprints(PROJECT_ID)}`,
        async (route) => {
            await route.fulfill({ status: 200, json: sprints })
        }
    )

    // Members
    await page.route(
        `**${API_ROUTES.projectMembers(PROJECT_ID)}`,
        async (route) => {
            await route.fulfill({ status: 200, json: members })
        }
    )

    // Issues (GET)
    await page.route(
        `**${API_ROUTES.projectIssues(PROJECT_ID)}`,
        async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, json: tasks })
            } else {
                // POST — create task
                const body = JSON.parse(route.request().postData() ?? '{}')
                const created: Task = {
                    id: 9999,
                    projectId: PROJECT_ID,
                    sprintId: sprints[0]?.id ?? 1,
                    featureId: body.featureId ?? 100,
                    title: body.title,
                    description: body.description ?? '',
                    status: body.status ?? 'open',
                    type: body.type ?? 'TASK',
                    assigneeId: body.assigneeId ?? null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    estimatedHours: body.estimatedHours ?? 4,
                    actualHours: 0,
                    isVisible: true,
                }
                await route.fulfill({ status: 201, json: created })
            }
        }
    )

    // Features by sprint
    await page.route(
        `**${API_ROUTES.sprintFeatures('*' as unknown as number)}`,
        async (route) => {
            await route.fulfill({ status: 200, json: features })
        }
    )
    // Explicit route for sprint 1 features
    await page.route(`**/sprints/*/features`, async (route) => {
        await route.fulfill({ status: 200, json: features })
    })

    // PATCH /issues/:id — update task
    await page.route(`**/issues/**`, async (route) => {
        const method = route.request().method()
        if (method === 'PATCH') {
            const url = route.request().url()
            const idStr = url.split('/issues/')[1]?.split('?')[0]
            const taskId = Number(idStr)
            const body = JSON.parse(route.request().postData() ?? '{}')
            const index = tasks.findIndex((t) => t.id === taskId)
            if (index >= 0) {
                tasks[index] = {
                    ...tasks[index],
                    ...body,
                }
            }
            await route.fulfill({
                status: 200,
                json: tasks[index],
            })
        } else if (method === 'DELETE') {
            const url = route.request().url()
            const idStr = url.split('/issues/')[1]?.split('?')[0]
            const taskId = Number(idStr)
            tasks = tasks.filter((t) => t.id !== taskId)
            await route.fulfill({
                status: 204,
            })
        } else {
            await route.continue()
        }
    })

    // Vector reindex (fire-and-forget in app)
    await page.route(`**/vector/reindex**`, async (route) => {
        await route.fulfill({ status: 200, json: { ok: true } })
    })

    // Vector search
    await page.route(`**/vector/search**`, async (route) => {
        await route.fulfill({ status: 200, json: [] })
    })
}

export async function mockDashboardAPIs(
    page: Page,
    opts: {
        sprints?: Sprint[]
        tasksByUser?: TasksByUser[]
        hoursByUser?: HoursByUser[]
        kpiSummary?: KpiSummary
    } = {}
): Promise<void> {
    const sprints = opts.sprints ?? MOCK_SPRINTS
    const tasksByUser = opts.tasksByUser ?? MOCK_TASKS_BY_USER
    const hoursByUser = opts.hoursByUser ?? MOCK_HOURS_BY_USER
    const kpi = opts.kpiSummary ?? MOCK_KPI_SUMMARY

    await page.route(
        `**${API_ROUTES.projectSprints(PROJECT_ID)}`,
        async (route) => {
            await route.fulfill({ status: 200, json: sprints })
        }
    )

    await page.route(`**/kpis/summary**`, async (route) => {
        await route.fulfill({ status: 200, json: kpi })
    })

    await page.route(`**/kpis/tasks-by-user**`, async (route) => {
        await route.fulfill({ status: 200, json: tasksByUser })
    })

    await page.route(`**/kpis/hours-by-user**`, async (route) => {
        await route.fulfill({ status: 200, json: hoursByUser })
    })

    await page.route(`**/kpis/real-hours-by-user**`, async (route) => {
        await route.fulfill({ status: 200, json: hoursByUser })
    })

    await page.route(`**${API_ROUTES.users}`, async (route) => {
        await route.fulfill({ status: 200, json: MOCK_MEMBERS })
    })

    await page.route(`**/projects/${PROJECT_ID}/issues**`, async (route) => {
        await route.fulfill({ status: 200, json: MOCK_TASKS })
    })
}

export async function mockAiReportsAPIs(
    page: Page,
    reports: DelayReport[] = MOCK_DELAY_REPORTS
): Promise<void> {
    await page.route('**/overdue-reports**', async (route) => {
        await route.fulfill({
            status: 200,
            json: reports,
        })
    })
}

export async function fillLoginForm(
    page: Page,
    email: string,
    password: string
): Promise<void> {
    await page.goto(ROUTES.login)

    await expect(page.getByTestId('login-email')).toBeVisible()
    await expect(page.getByTestId('login-password')).toBeVisible()

    await page.getByTestId('login-email').fill(email)
    await page.getByTestId('login-password').fill(password)
}

/**
 * Perform a complete mock login and land on the dashboard.
 */
export async function loginAs(
    page: Page,
    user: UserCredentials
): Promise<void> {
    await mockLoginSuccess(page, user)
    await page.goto(ROUTES.login)
    await page.getByTestId('login-email').fill(user.email)
    await page.getByTestId('login-password').fill(user.password)
    await page.getByTestId('login-submit').click()
    await page.waitForURL('**/dashboard')
}

export async function setAuthToken(
    page: Page,
    user: UserCredentials
): Promise<void> {
    const payload = MOCK_LOGIN_RESPONSE(user)
    await page.addInitScript((authUser) => {
        localStorage.setItem('omi_auth', JSON.stringify(authUser))
    }, payload)
}

export async function waitForTaskManagerReady(page: Page): Promise<void> {
    await expect(page.locator('h1:has-text("Gestor de Tareas")')).toBeVisible()
}

export async function openCreateTaskModal(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Crear Tarea' }).click()
    await expect(page.locator('h2:has-text("Crear Tarea")')).toBeVisible()
}

export async function fillCreateTaskModal(
    page: Page,
    opts: {
        title: string
        type?: string
        estimatedHours?: number
        assigneeName?: string | null
        dueDate?: string
    }
): Promise<void> {
    // Title
    await page
        .locator('input[placeholder="Ej: Implementar exportación CSV"]')
        .fill(opts.title)

    // Type
    if (opts.type) {
        await page.getByTestId('type-select').selectOption(opts.type)
    }

    // Estimated hours
    if (opts.estimatedHours !== undefined) {
        const numInput = page.locator('input[type="number"]').first()
        await numInput.fill(String(opts.estimatedHours))
    }

    // Due date
    if (opts.dueDate) {
        await page.locator('input[type="date"]').fill(opts.dueDate)
    }

    // Assignee
    if (opts.assigneeName) {
        await page
            .getByTestId('assignee-select')
            .selectOption({ label: opts.assigneeName })
    }

    // Submit
    await page.getByTestId('create-task-submit').click()
}
