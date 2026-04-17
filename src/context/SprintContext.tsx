/**
 * Shared sprint selection for header dropdown and dashboard comparativo.
 * No API; selection is local state so changing the dropdown updates dashboard metrics.
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { mockSprints } from '../mock'
import { getActiveSprint } from '../mock/sprints'

interface SprintContextValue {
  selectedSprintId: number
  setSelectedSprintId: (id: number) => void
}

const SprintContext = createContext<SprintContextValue | null>(null)

export function SprintProvider({ children }: { children: React.ReactNode }) {
  const activeSprint = getActiveSprint()
  const [selectedSprintId, setSelectedSprintId] = useState(
    activeSprint?.id ?? mockSprints[0]?.id ?? ''
  )
  const setter = useCallback((id: number) => setSelectedSprintId(id), [])
  return (
    <SprintContext.Provider value={{ selectedSprintId, setSelectedSprintId: setter }}>
      {children}
    </SprintContext.Provider>
  )
}

export function useSprint(): SprintContextValue {
  const ctx = useContext(SprintContext)
  if (!ctx) throw new Error('useSprint must be used within SprintProvider')
  return ctx
}
