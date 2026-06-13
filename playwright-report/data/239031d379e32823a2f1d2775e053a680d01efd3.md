# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Suite AI — AI Delay Reports >> [AI-06] — negative: non-existent category badge does not appear
- Location: e2e/suites/dashboard.spec.ts:251:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('nonexistent_category')
Expected: visible
Timeout: 1000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 1000ms
  - waiting for getByText('nonexistent_category')

```

```yaml
- complementary:
  - img "Oracle Smart Productivity"
  - heading "Oracle Smart Productivity" [level=1]
  - paragraph: Control Center
  - navigation:
    - paragraph: Navegación
    - list:
      - listitem:
        - link "Dashboard":
          - /url: /dashboard
      - listitem:
        - link "Gestor de Tareas":
          - /url: /task-manager
      - listitem:
        - link "Reportes de Tareas Atrasadas":
          - /url: /ai-reports
- banner
- main:
  - heading "AI Delay Reports" [level=1]
  - paragraph: Análisis automático de tareas fuera de tiempo
  - paragraph: Reportes generados
  - paragraph: "2"
  - paragraph: Tareas con retraso
  - paragraph: Alta severidad
  - paragraph: "1"
  - paragraph: Requieren atención
  - heading "Impacto general del sprint" [level=2]
  - paragraph: Se registraron 2 retrasos con un promedio de 3.5 días
  - paragraph: "Recomendaciones:"
  - list:
    - listitem: 1 tareas críticas requieren atención inmediata
    - listitem: El promedio de retraso es alto, revisar planificación
  - paragraph: "Nueva fecha sugerida: 16/6/2026"
  - paragraph: Se recomienda extender el sprint ligeramente
  - heading "Causas principales detectadas por IA" [level=2]
  - text: technical_debt — 1 scope_creep — 1
  - heading "Reportes detallados" [level=2]
  - heading "Implement login flow" [level=3]
  - paragraph: Carlos López • 30/11/2024
  - text: Alta
  - paragraph: "IA: Task was delayed due to unexpected technical complexity in the OAuth integration."
  - paragraph: "Impacto: Delay impacts sprint velocity by 18%."
  - paragraph: "Retraso: 5 días"
  - paragraph: "Recomendación: Break down OAuth tasks into smaller subtasks in future sprints."
  - paragraph: "Respuesta del desarrollador:"
  - paragraph: "\"The OAuth library had breaking changes in the latest version.\""
  - text: "Categoría: technical_debt 6/12/2024"
  - heading "Design dashboard UI" [level=3]
  - paragraph: María Martínez • 2/12/2024
  - text: Media
  - paragraph: "IA: Design iteration took longer due to multiple stakeholder revision rounds."
  - paragraph: "Impacto: Minor impact on overall sprint timeline."
  - paragraph: "Retraso: 2 días"
  - paragraph: "Recomendación: Establish design approval checkpoints earlier in the sprint."
  - paragraph: "Respuesta del desarrollador:"
  - paragraph: "\"Required three rounds of feedback from product team.\""
  - text: "Categoría: scope_creep 5/12/2024"
```

# Test source

```ts
  162 | 
  163 |         const consoleErrors: string[] = []
  164 |         page.on('console', (msg) => {
  165 |             if (msg.type() === 'error') consoleErrors.push(msg.text())
  166 |         })
  167 | 
  168 |         await page.goto(ROUTES.dashboard)
  169 |         await expect(page.getByTestId('dashboard-title')).toBeVisible()
  170 | 
  171 |         const apiErrors = consoleErrors.filter(
  172 |             (e) => e.includes('fetch') || e.includes('404')
  173 |         )
  174 |         expect(apiErrors).toHaveLength(0)
  175 |     })
  176 | })
  177 | 
  178 | test.describe('Suite AI — AI Delay Reports', () => {
  179 |     test.beforeEach(async ({ page }) => {
  180 |         await setAuthToken(page, USERS.manager)
  181 |         await mockAiReportsAPIs(page)
  182 |     })
  183 | 
  184 |     test('[AI-01] — AI Reports page heading is visible', async ({ page }) => {
  185 |         await page.goto(ROUTES.reports)
  186 |         await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
  187 |         await expect(
  188 |             page.getByText('Análisis automático de tareas fuera de tiempo')
  189 |         ).toBeVisible()
  190 |     })
  191 | 
  192 |     test('[AI-02] — KPI cards reflect total and high-severity reports', async ({
  193 |         page,
  194 |     }) => {
  195 |         await page.goto(ROUTES.reports)
  196 |         await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
  197 | 
  198 |         await expect(
  199 |             page.getByTestId('kpi-value-reportes-generados')
  200 |         ).toHaveText(String(MOCK_DELAY_REPORTS.length))
  201 | 
  202 |         await expect(page.getByTestId('kpi-value-alta-severidad')).toHaveText(
  203 |             '1'
  204 |         )
  205 |     })
  206 | 
  207 |     test('[AI-03] — report cards display task title and developer name', async ({
  208 |         page,
  209 |     }) => {
  210 |         await page.goto(ROUTES.reports)
  211 |         await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
  212 | 
  213 |         for (const report of MOCK_DELAY_REPORTS) {
  214 |             await expect(page.getByText(report.taskTitle).first()).toBeVisible()
  215 |             await expect(
  216 |                 page.getByText(report.developerName).first()
  217 |             ).toBeVisible()
  218 |         }
  219 |     })
  220 | 
  221 |     test('[AI-04] — report cards display AI summary and recommendations', async ({
  222 |         page,
  223 |     }) => {
  224 |         await page.goto(ROUTES.reports)
  225 |         await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
  226 | 
  227 |         const firstReport = MOCK_DELAY_REPORTS[0]
  228 |         await expect(
  229 |             page.getByTestId(`report-summary-${firstReport.id}`)
  230 |         ).toContainText(firstReport.aiSummary)
  231 | 
  232 |         await expect(
  233 |             page.getByTestId(`report-recommendation-${firstReport.id}`)
  234 |         ).toContainText(firstReport.recommendation)
  235 |     })
  236 | 
  237 |     test('[AI-05] — empty reports state shows "Sin datos aún"', async ({
  238 |         page,
  239 |     }) => {
  240 |         await page.unrouteAll()
  241 |         await mockAiReportsAPIs(page, [])
  242 | 
  243 |         await page.goto(ROUTES.reports)
  244 |         await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
  245 | 
  246 |         await expect(page.getByTestId('impact-summary')).toHaveText(
  247 |             'Sin datos aún'
  248 |         )
  249 |     })
  250 | 
  251 |     test('[AI-06] — negative: non-existent category badge does not appear', async ({
  252 |         page,
  253 |     }) => {
  254 |         test.fail(
  255 |             true,
  256 |             'Known: if a new AI category is added without a badge, this should fail and remind us to update UI'
  257 |         )
  258 | 
  259 |         await page.goto(ROUTES.reports)
  260 |         await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
  261 | 
> 262 |         await expect(page.getByText('nonexistent_category')).toBeVisible()
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  263 |     })
  264 | 
  265 |     test('[AI-07] — high average delay shows sprint extension recommendation', async ({
  266 |         page,
  267 |     }) => {
  268 |         await page.unrouteAll()
  269 |         await mockAiReportsAPIs(page, [
  270 |             { ...MOCK_DELAY_REPORTS[0], delayDays: 5 },
  271 |             { ...MOCK_DELAY_REPORTS[1], delayDays: 4 },
  272 |         ])
  273 | 
  274 |         await page.goto(ROUTES.reports)
  275 |         await expect(page.getByTestId('delay-reports-page-title')).toBeVisible()
  276 | 
  277 |         await expect(page.getByTestId('suggested-adjustment')).toBeVisible()
  278 | 
  279 |         await expect(
  280 |             page.getByTestId('suggested-adjustment-note')
  281 |         ).toContainText('extender el sprint')
  282 |     })
  283 | })
  284 | 
```