/**
 * Mock AI recommendations for "Sugerencias IA" drawer.
 * Simulated suggestions only; no real API or ML.
 */

export interface AIRecommendation {
   id: string
   taskId: string
   taskTitle: string
   suggestedUserId: string
   suggestedUserName: string
   confidence: number
   reason: string
}

export const mockAIRecommendations: AIRecommendation[] = [
   {
      id: 'rec1',
      taskId: 't5b',
      taskTitle: 'Bug: login falla en Safari',
      suggestedUserId: 'u2',
      suggestedUserName: 'Yael Varela',
      confidence: 82,
      reason: 'Carga baja actual, buen desempeño en Bugs.',
   },
   {
      id: 'rec2',
      taskId: 't7',
      taskTitle: 'Integración con SSO',
      suggestedUserId: 'u2',
      suggestedUserName: 'Yael Varela',
      confidence: 78,
      reason: 'Experiencia en autenticación y menor variación estimado/real.',
   },
   {
      id: 'rec3',
      taskId: 't8',
      taskTitle: 'Bug: timeout en exportación PDF',
      suggestedUserId: 'u4',
      suggestedUserName: 'Sebastián Soria',
      confidence: 85,
      reason: 'QA Lead, alta tasa de cierre en bugs.',
   },
   {
      id: 'rec4',
      taskId: 't5',
      taskTitle: 'Revisión de seguridad',
      suggestedUserId: 'u1',
      suggestedUserName: 'Admin Oracle',
      confidence: 90,
      reason: 'Responsable de configuración y auditorías.',
   },
]
