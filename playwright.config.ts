import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './e2e/suites',
    testMatch: '**/*.spec.ts',

    timeout: 10000,
    expect: {
        timeout: 1_000,
    },

    retries: process.env.CI ? 2 : 0,

    fullyParallel: true,
    workers: process.env.CI ? 2 : undefined,

    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
    ],

    use: {
        baseURL: 'http://localhost:5173',
        video: 'on',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        viewport: { width: 1280, height: 720 },
        locale: 'es-MX',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
})
