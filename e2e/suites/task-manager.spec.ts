import { test, expect } from '@playwright/test'
import {
    USERS,
    ROUTES,
    MOCK_TASKS,
    MOCK_MEMBERS,
    MOCK_SPRINTS,
    TASK_CREATION_FIXTURES,
    STATUS_CHANGE_FIXTURES,
    makeMockTask,
} from '../support/types'
import {
    setAuthToken,
    mockTaskManagerAPIs,
    waitForTaskManagerReady,
    openCreateTaskModal,
    fillCreateTaskModal,
} from '../support/helpers'

test.describe('Suite TM — Task Manager', () => {
    test.beforeEach(async ({ page }) => {
        await setAuthToken(page, USERS.developer)
        await mockTaskManagerAPIs(page)
    })

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus) {
            const path = `test-results/tasks-failure-${Date.now()}.png`
            await page.screenshot({ path, fullPage: true })
            testInfo.attachments.push({
                name: 'screenshot',
                path,
                contentType: 'image/png',
            })
        }
    })

    test('[TM-01] should load task manager page and display team members', async ({
        page,
    }) => {
        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)

        for (const member of MOCK_MEMBERS) {
            await expect(page.getByText(member.name).first()).toBeVisible()
        }
    })

    test('[TM-02] should render all available sprints in sprint filter', async ({
        page,
    }) => {
        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)

        for (const sprint of MOCK_SPRINTS) {
            await expect(
                page.getByRole('option', { name: sprint.name }).first()
            ).toBeAttached()
        }
    })

    test('[TM-03] should hide non matching tasks when filtering by in progress status', async ({
        page,
    }) => {
        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)

        const estadoSelect = page.getByTestId('status-filter')
        await estadoSelect.selectOption('in_progress')

        const openOnlyTask = MOCK_TASKS.find(
            (t) => t.status === 'open' && t.assigneeId
        )
        if (openOnlyTask) {
            await expect(page.getByText(openOnlyTask.title)).not.toBeVisible()
        }
    })

    test('[TM-04] should open create task modal when clicking create task button', async ({
        page,
    }) => {
        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)
        await openCreateTaskModal(page)

        await expect(
            page.getByRole('heading', { name: 'Crear Tarea' })
        ).toBeVisible()
        await expect(
            page.getByPlaceholder('Ej: Implementar exportación CSV')
        ).toBeVisible()
    })

    test('[TM-05] should close create task modal when cancel button is clicked', async ({
        page,
    }) => {
        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)
        await openCreateTaskModal(page)

        await page.getByRole('button', { name: 'Cancelar' }).click()
        await expect(
            page.getByRole('heading', { name: 'Crear Tarea' })
        ).not.toBeVisible()
    })

    for (const fixture of TASK_CREATION_FIXTURES) {
        test(`[TM-06] should create task successfully (${fixture.label})`, async ({
            page,
        }) => {
            await page.unrouteAll()
            await mockTaskManagerAPIs(page, {
                tasks: [
                    ...MOCK_TASKS,
                    makeMockTask({
                        id: 9999,
                        title: fixture.title,
                        status: 'open',
                    }),
                ],
            })

            await page.goto(ROUTES.tasks)
            await waitForTaskManagerReady(page)
            let capturedPayload: Record<string, unknown> = {}
            await page.route('**/issues', async (route) => {
                const request = route.request()

                if (request.method() === 'POST') {
                    const raw = request.postData() ?? '{}'
                    capturedPayload = JSON.parse(raw)
                }

                await route.continue()
            })

            await openCreateTaskModal(page)
            await fillCreateTaskModal(page, {
                title: fixture.title,
                type: fixture.type,
                estimatedHours: fixture.estimatedHours,
                assigneeName: fixture.assigneeName,
            })

            await expect(
                page.getByRole('heading', { name: 'Crear Tarea' })
            ).not.toBeVisible()

            expect.soft(capturedPayload.title).toBe(fixture.title)
            expect.soft(capturedPayload.type).toBe(fixture.type)
            expect
                .soft(capturedPayload.estimatedHours)
                .toBe(fixture.estimatedHours)
        })
    }

    for (const fixture of STATUS_CHANGE_FIXTURES) {
        test(`[TM-07] should update task status (${fixture.label})`, async ({
            page,
        }) => {
            const targetTask = MOCK_TASKS.find((t) => t.id === fixture.taskId)

            const tasksWithTarget = targetTask
                ? MOCK_TASKS
                : [
                      ...MOCK_TASKS,
                      makeMockTask({
                          id: fixture.taskId,
                          title: fixture.taskTitle,
                      }),
                  ]

            await page.unrouteAll()
            await mockTaskManagerAPIs(page, { tasks: tasksWithTarget })

            await page.goto(ROUTES.tasks)
            await waitForTaskManagerReady(page)

            const statusSelect = page.getByTestId(
                `status-select-${fixture.taskId}`
            )

            if (fixture.newStatus === 'closed') {
                await statusSelect.selectOption('closed')

                const hoursModal = page.getByRole('heading', {
                    name: 'Registrar horas reales',
                })

                await expect(hoursModal).toBeVisible()

                await page.getByPlaceholder('Horas reales').fill('5')

                await page
                    .getByRole('button', {
                        name: 'Confirmar',
                    })
                    .click()

                await expect(hoursModal).not.toBeVisible()
            } else {
                await statusSelect.selectOption(fixture.newStatus)

                await expect(statusSelect).toHaveValue(fixture.newStatus)
            }
        })
    }

    test('[TM-08] should display delete confirmation dialog', async ({
        page,
    }) => {
        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)

        const task = MOCK_TASKS[0]
        await page.getByTestId(`delete-task-${task.id}`).click()

        await expect(page.getByTestId('delete-task-title')).toBeVisible()
        await expect(page.getByTestId('delete-task-message')).toBeVisible()
    })

    test('[TM-09] should send delete request after confirmation', async ({
        page,
    }) => {
        let deleteUrl = ''
        page.on('request', (req) => {
            if (req.method() === 'DELETE') deleteUrl = req.url()
        })

        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)

        const task = MOCK_TASKS[0]
        await page.getByTestId(`delete-task-${task.id}`).click()
        await expect(page.getByTestId('delete-task-title')).toBeVisible()

        await page.getByTestId('confirm-delete-task').click()

        await expect(page.getByTestId('delete-task-title')).not.toBeVisible()

        expect(deleteUrl).toMatch(/\/issues\/\d+/)
    })

    test('[TM-10] should not delete task when deletion is cancelled', async ({
        page,
    }) => {
        let deleteFired = false
        page.on('request', (req) => {
            if (req.method() === 'DELETE') deleteFired = true
        })

        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)

        const task = MOCK_TASKS[0]
        await page.getByTestId(`delete-task-${task.id}`).click()
        await page.getByTestId('cancel-delete-task').click()

        await expect(page.getByTestId('delete-task-title')).not.toBeVisible()
        expect(deleteFired).toBe(false)
    })

    test('[TM-11] should keep task unchanged when real hours modal is cancelled', async ({
        page,
    }) => {
        const inProgressTask = MOCK_TASKS.find(
            (t) => t.status === 'in_progress'
        )
        if (!inProgressTask) {
            test.skip(true, 'No in-progress task in fixture')
            return
        }

        await page.goto(ROUTES.tasks)
        await waitForTaskManagerReady(page)

        await page
            .getByTestId(`status-select-${inProgressTask.id}`)
            .selectOption('closed')

        const modal = page.getByTestId('register-hours-title')
        await expect(modal).toBeVisible()

        await page.getByTestId('cancel-close-task').click()
        await expect(modal).not.toBeVisible()
    })
})
