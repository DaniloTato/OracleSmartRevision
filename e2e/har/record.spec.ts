// ============================================================
//  e2e/har/README — HAR File Usage Guide
// ============================================================
//
//  HAR (HTTP Archive) files record real network traffic and
//  replay it in tests so you never hit the real API.
//
//  ── Recording a HAR file ───────────────────────────────────
//
//  Run this script once against your real backend:
//
//    npx playwright test --project=chromium e2e/har/record.spec.ts
//
//  It will create:
//    e2e/har/task-manager.har
//    e2e/har/dashboard.har
//    e2e/har/ai-reports.har
//
//  ── Using a HAR file in a test ─────────────────────────────
//
//    test('loads dashboard from HAR', async ({ page }) => {
//      await page.routeFromHAR('./e2e/har/dashboard.har', {
//        url:    '**/api/**',
//        update: false,   // false = replay; true = re-record
//      })
//      await page.goto('/dashboard')
//      await expect(page.locator('h1').first()).toBeVisible()
//    })
//
// ============================================================

// record.spec.ts — Run once to capture real API traffic
// Requires a running backend at http://localhost:3000

import { test } from '@playwright/test'
import { USERS, ROUTES } from '../support/types'
import { loginAs } from '../support/helpers'

test.describe('HAR Recording', () => {
    test('record — task manager', async ({ page }) => {
        await page.routeFromHAR('./e2e/har/task-manager.har', {
            url: '**/api/**',
            update: true,
        })
        await loginAs(page, USERS.manager)
        await page.goto(ROUTES.tasks)
        await page.waitForLoadState('networkidle')
    })

    test('record — dashboard', async ({ page }) => {
        await page.routeFromHAR('./e2e/har/dashboard.har', {
            url: '**/api/**',
            update: true,
        })
        await loginAs(page, USERS.manager)
        await page.goto(ROUTES.dashboard)
        await page.waitForLoadState('networkidle')
    })

    test('record — ai reports', async ({ page }) => {
        await page.routeFromHAR('./e2e/har/ai-reports.har', {
            url: '**/api/**',
            update: true,
        })
        await loginAs(page, USERS.manager)
        await page.goto(ROUTES.reports)
        await page.waitForLoadState('networkidle')
    })
})
