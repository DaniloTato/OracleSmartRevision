import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { SprintContextValue} from '../types/sprintContext'
import type { Sprint } from '../types'
import { getSprints } from '../api/sprintContext'

const SprintContext = createContext<SprintContextValue | null>(null)

export function SprintProvider({ children }: { children: React.ReactNode }) {
   const [sprints, setSprints] = useState<Sprint[]>([])
   const [selectedSprintId, setSelectedSprintId] = useState<number>(0)
   const [loading, setLoading] = useState(true)

   //HARD CODED PORJECT ID
   const projectId = 1;

   useEffect(() => {
      async function fetchSprints() {
         try {
            //lets use the API function
            const data: Sprint[] = await getSprints(projectId);

            setSprints(data)

            // pick default sprint (first or active)
            if (data.length > 0) {
               const active = data.find(s => s.status === 'active') || data[0]
               setSelectedSprintId(active.id)
            }
         } catch (err) {
            console.error('Error fetching sprints', err)
         } finally {
            setLoading(false)
         }
      }

      fetchSprints()
   }, [])

   const setter = useCallback((id: number) => setSelectedSprintId(id), [])

   return (
      <SprintContext.Provider
         value={{ selectedSprintId, setSelectedSprintId: setter, sprints, loading }}
      >
         {children}
      </SprintContext.Provider>
   )
}

export function useSprint(): SprintContextValue {
   const ctx = useContext(SprintContext)
   if (!ctx) throw new Error('useSprint must be used within SprintProvider')
   return ctx
}