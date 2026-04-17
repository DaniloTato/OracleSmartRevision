/**
 * Mock users for assignees, activity log, and team performance.
 * No API or auth; used for display only.
 */

import type { User } from '../types'

export const mockUsers: User[] = [
  { id: 1, name: 'Admin Oracle', role: 'Administrador' },
  { id: 2, name: 'Yael Varela', role: 'Desarrolladora' },
  { id: 3, name: 'Danilo Tato', role: 'Desarrollador' },
  { id: 4, name: 'Sebastián Soria', role: 'Desarrollador' },
  { id: 5, name: 'Sebastián Certuche', role: 'Desarrollador' },
]

export function getUserById(id: number): User | undefined {
  return mockUsers.find((u) => u.id === id)
}

export function getUserDisplayName(id: number): string {
  return getUserById(id)?.name ?? 'Sin asignar'
}
