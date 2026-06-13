import { test, expect } from '@playwright/test'
import { USERS, ROUTES } from '../support/types'
import {
    mockLoginSuccess,
    mockLoginFailure,
    mockDashboardAPIs,
    fillLoginForm,
    loginAs,
} from '../support/helpers'

test.describe('Suite AU — Authentication', () => {
    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus) {
            const screenshotPath = `test-results/auth-failure-${testInfo.title.replace(/\s/g, '_')}.png`
            await page.screenshot({ path: screenshotPath, fullPage: true })
            testInfo.attachments.push({
                name: 'failure-screenshot',
                path: screenshotPath,
                contentType: 'image/png',
            })
        }
    })

    test('[AU-01] shows error banner for invalid credentials', async ({
        page,
    }) => {
        await mockLoginFailure(page)

        await fillLoginForm(page, USERS.invalid.email, USERS.invalid.password)

        await page.getByTestId('login-submit').click()

        const errorBanner = page.getByTestId('login-error')

        await expect(errorBanner).toBeVisible()
        await expect(errorBanner).toContainText('Invalid email or password')

        expect(page.url()).not.toContain(ROUTES.dashboard)
    })

    test('[AU-02] manager can log in and reach dashboard', async ({ page }) => {
        await mockDashboardAPIs(page)
        await loginAs(page, USERS.manager)

        await expect(page).toHaveURL(/dashboard/)
        await expect(page.getByTestId('dashboard-title')).toBeVisible()
    })

    test('[AU-03] developer can log in and reach dashboard', async ({
        page,
    }) => {
        await mockDashboardAPIs(page)
        await loginAs(page, USERS.developer)

        await expect(page).toHaveURL(/dashboard/)
    })

    test('[AU-04] submit button is disabled while signing in', async ({
        page,
    }) => {
        // Delay the API so we can observe the loading state
        await page.route(`**/auth/login`, async (route) => {
            await new Promise((r) => setTimeout(r, 600))
            await route.fulfill({
                status: 200,
                json: {
                    token: 'tok',
                    userId: 1,
                    email: USERS.manager.email,
                    name: USERS.manager.name,
                    roleId: 1,
                },
            })
        })

        await mockDashboardAPIs(page)
        await fillLoginForm(page, USERS.manager.email, USERS.manager.password)

        const submitBtn = page.getByTestId('login-submit')

        await submitBtn.click()
        await expect(submitBtn).toBeDisabled()
        await expect(submitBtn).toContainText('Signing in')
    })

    test('[AU-05] empty email prevents form submission', async ({ page }) => {
        await page.goto(ROUTES.login)
        await page.getByTestId('login-password').fill('somepassword')

        await page.getByTestId('login-submit').click()
        await expect(page).toHaveURL(/\/login/)
    })

    test('[AU-06] retry with correct credentials after failed attempt', async ({
        page,
    }) => {
        // First attempt — fail
        await mockLoginFailure(page)
        await fillLoginForm(page, USERS.invalid.email, USERS.invalid.password)
        await page.getByTestId('login-submit').click()

        await expect(page.getByTestId('login-error')).toBeVisible()

        // Second attempt — succeed
        await page.unrouteAll()
        await mockLoginSuccess(page, USERS.developer)
        await mockDashboardAPIs(page)

        await page.getByTestId('login-email').fill(USERS.developer.email)
        await page.getByTestId('login-password').fill(USERS.developer.password)
        await page.getByTestId('login-submit').click()

        await expect(page).toHaveURL(/dashboard/)
    })

    test('[AU-07] login page displays the brand logo', async ({ page }) => {
        await page.goto(ROUTES.login)

        const logo = page.getByRole('img', { name: /Oracle Smart/i })
        await expect(logo).toBeVisible()
    })

    test('[AU-08] password field has type="password"', async ({ page }) => {
        await page.goto(ROUTES.login)
        const pwInput = page.getByTestId('login-password')
        await expect(pwInput).toHaveAttribute('type', 'password')
    })

    test('[AU-09] auth token is persisted after successful login @slow', async ({
        page,
    }) => {
        test.slow()

        await mockLoginSuccess(page, USERS.manager)
        await mockDashboardAPIs(page)

        await fillLoginForm(page, USERS.manager.email, USERS.manager.password)
        await page.getByTestId('login-submit').click()

        await page.waitForURL(/dashboard/)

        const auth = await page.evaluate(() => localStorage.getItem('omi_auth'))

        expect(auth).toBeTruthy()

        const parsed = JSON.parse(auth!)

        expect(parsed.token).toBe('mock-jwt-token-xyz-123')
    })
})
