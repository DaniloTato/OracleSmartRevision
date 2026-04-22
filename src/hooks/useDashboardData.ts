// src/hooks/useDashboardData.ts
import { useEffect, useState } from 'react'
import { loadDashboardData } from '../services/dashboard'
import type { Sprint, User } from '../types'
import type { KpiSummary, TasksByUser, HoursByUser } from '../types/dashboard'

export function useDashboardData(projectId: number, sprintId: number) {
   const [loading, setLoading] = useState(true)
   const [data, setData] = useState({
      sprints: [] as Sprint[],
      summary: null as KpiSummary | null,
      tasks: [] as TasksByUser[],
      hours: [] as HoursByUser[],
      users: [] as User[],
   })

   useEffect(() => {
      async function load() {
         setLoading(true)
         const res = await loadDashboardData(projectId, sprintId)
         setData(res)
         setLoading(false)
      }

      load()
   }, [projectId, sprintId])

   return { ...data, loading }
}
