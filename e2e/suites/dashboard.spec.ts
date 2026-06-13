import { test, expect } from '@playwright/test'
import {
    USERS,
    ROUTES,
    MOCK_SPRINTS,
    MOCK_MEMBERS,
    MOCK_TASKS_BY_USER,
    MOCK_DELAY_REPORTS,
} from '../support/types'
import {
    setAuthToken,
    mockDashboardAPIs,
    mockAiReportsAPIs,
} from '../support/helpers'

test.describe('Suite DB — Dashboard & Analytics', () => {
    test.beforeEach(async ({ page }) => {
        await setAuthToken(page, USERS.manager)
        await mockDashboardAPIs(page)
    })

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus) {
            const path = `test-results/dashboard-failure-${Date.now()}.png`
            await page.screenshot({ path, fullPage: true })
            testInfo.attachments.push({
                name: 'screenshot',
                path,
                contentType: 'image/png',
            })
        }
    })

    test('[DB-01] dashboard heading and subtitle render', async ({ page }) => {
        await page.goto(ROUTES.dashboard)

        await expect(page.getByTestId('dashboard-title')).toBeVisible()
        await expect(
            page.getByText('Dashboard ejecutivo de productividad')
        ).toBeVisible()
    })

    test('[DB-02] six KPI cards are present on the dashboard', async ({
        page,
    }) => {
        await page.goto(ROUTES.dashboard)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()

        const kpis = [
            'completed-tasks',
            'total-real-hours',
            'avg-task-dev',
            'avg-hours-dev',
            'median-task-dev',
            'median-hours-dev',
        ]

        for (const kpi of kpis) {
            await expect(page.getByTestId(`kpi-card-${kpi}`)).toBeAttached()
        }
    })

    test('[DB-03] — sprint selector contains all mock sprints', async ({
        page,
    }) => {
        await page.goto(ROUTES.dashboard)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()

        const sprintSelect = page.getByRole('combobox').first()
        await expect(sprintSelect).toBeVisible()

        for (const sprint of MOCK_SPRINTS) {
            await expect(
                page.getByRole('option', { name: sprint.name }).first()
            ).toBeAttached()
        }

        await expect(
            page.getByRole('option', { name: 'All Sprints' }).first()
        ).toBeAttached()
    })

    test('[DB-04] — developer selector shows all team members', async ({
        page,
    }) => {
        await page.goto(ROUTES.dashboard)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()

        for (const member of MOCK_MEMBERS) {
            await expect(
                page.getByRole('option', { name: member.name }).first()
            ).toBeAttached()
        }
    })

    test('[DB-05] — selecting a sprint shows per-developer chart', async ({
        page,
    }) => {
        await page.goto(ROUTES.dashboard)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()

        await expect(
            page.getByText('Tareas completadas por sprint y desarrollador')
        ).toBeVisible()

        await page.getByRole('combobox').first().selectOption('1')

        await expect(
            page.getByText('Tareas completadas por desarrollador')
        ).toBeVisible()
    })

    test('[DB-06] — developer detail table shows all developers', async ({
        page,
    }) => {
        await page.goto(ROUTES.dashboard)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()

        await expect(
            page.getByRole('columnheader', { name: 'Developer' })
        ).toBeVisible()
        await expect(
            page.getByRole('columnheader', { name: 'Tasks' })
        ).toBeVisible()
        await expect(
            page.getByRole('columnheader', { name: 'Hours' })
        ).toBeVisible()

        for (const entry of MOCK_TASKS_BY_USER) {
            await expect(
                page.getByRole('cell', { name: entry.user }).first()
            ).toBeVisible()
        }
    })

    test('[DB-07] — KPI values reflect mocked API data', async ({ page }) => {
        await page.unrouteAll()
        await mockDashboardAPIs(page, {
            tasksByUser: [
                { user: 'Alice', tasksCompleted: 5 },
                { user: 'Bob', tasksCompleted: 3 },
            ],
            hoursByUser: [
                { userId: 1, user: 'Alice', hours: 20 },
                { userId: 2, user: 'Bob', hours: 12 },
            ],
        })

        await page.goto(ROUTES.dashboard)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()

        //5 + 3 = 8
        await expect(page.getByTestId('kpi-value-completed-tasks')).toHaveText(
            '8'
        )
    })

    test('[DB-08] — full dashboard renders without network errors @slow', async ({
        page,
    }) => {
        test.slow()

        const consoleErrors: string[] = []
        page.on('console', (msg) => {
            if (msg.type() === 'error') consoleErrors.push(msg.text())
        })

        await page.goto(ROUTES.dashboard)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()

        const apiErrors = consoleErrors.filter(
            (e) => e.includes('fetch') || e.includes('404')
        )
        expect(apiErrors).toHaveLength(0)
    })
})

test.describe('Suite AI — AI Delay Reports', () => {
    test.beforeEach(async ({ page }) => {
        await setAuthToken(page, USERS.manager)
        await mockAiReportsAPIs(page)
    })

    test('[AI-01] — AI Reports page heading is visible', async ({ page }) => {
        await page.goto(ROUTES.reports)
        await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
        await expect(
            page.getByText('Análisis automático de tareas fuera de tiempo')
        ).toBeVisible()
    })

    test('[AI-02] — KPI cards reflect total and high-severity reports', async ({
        page,
    }) => {
        await page.goto(ROUTES.reports)
        await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()

        await expect(
            page.getByTestId('kpi-value-reportes-generados')
        ).toHaveText(String(MOCK_DELAY_REPORTS.length))

        await expect(page.getByTestId('kpi-value-alta-severidad')).toHaveText(
            '1'
        )
    })

    test('[AI-03] — report cards display task title and developer name', async ({
        page,
    }) => {
        await page.goto(ROUTES.reports)
        await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()

        for (const report of MOCK_DELAY_REPORTS) {
            await expect(page.getByText(report.taskTitle).first()).toBeVisible()
            await expect(
                page.getByText(report.developerName).first()
            ).toBeVisible()
        }
    })

    test('[AI-04] — report cards display AI summary and recommendations', async ({
        page,
    }) => {
        await page.goto(ROUTES.reports)
        await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()

        const firstReport = MOCK_DELAY_REPORTS[0]
        await expect(
            page.getByTestId(`report-summary-${firstReport.id}`)
        ).toContainText(firstReport.aiSummary)

        await expect(
            page.getByTestId(`report-recommendation-${firstReport.id}`)
        ).toContainText(firstReport.recommendation)
    })

    test('[AI-05] — empty reports state shows "Sin datos aún"', async ({
        page,
    }) => {
        await page.unrouteAll()
        await mockAiReportsAPIs(page, [])

        await page.goto(ROUTES.reports)
        await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()

        await expect(page.getByTestId('impact-summary')).toHaveText(
            'Sin datos aún'
        )
    })

    test('[AI-06] — negative: non-existent category badge does not appear', async ({
        page,
    }) => {
        test.fail(
            true,
            'Known: if a new AI category is added without a badge, this should fail and remind us to update UI'
        )

        await page.goto(ROUTES.reports)
        await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()

        await expect(page.getByText('nonexistent_category')).toBeVisible()
    })

    test('[AI-07] — high average delay shows sprint extension recommendation', async ({
        page,
    }) => {
        await page.unrouteAll()
        await mockAiReportsAPIs(page, [
            { ...MOCK_DELAY_REPORTS[0], delayDays: 5 },
            { ...MOCK_DELAY_REPORTS[1], delayDays: 4 },
        ])

        await page.goto(ROUTES.reports)
        await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()

        await expect(page.getByTestId('suggested-adjustment')).toBeVisible()

        await expect(
            page.getByTestId('suggested-adjustment-note')
        ).toContainText('extender el sprint')
    })
})
