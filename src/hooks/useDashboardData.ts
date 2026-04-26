// src/hooks/useDashboardData.ts
import { useEffect, useState } from 'react'
import { loadDashboardData } from '../services/dashboard'
import type { Sprint, User } from '../types'
import type { KpiSummary, TasksByUser, HoursByUser, TasksPerSprint } from '../types/dashboard'

export function useDashboardData(projectId: number, sprintId: number) {
   const [loading, setLoading] = useState(true)

   const [data, setData] = useState({
      sprints: [] as Sprint[],
      summary: null as KpiSummary | null,
      tasks: [] as TasksByUser[],
      hours: [] as HoursByUser[],
      users: [] as User[],
      multiSprintTasks: [] as TasksPerSprint[],
   })

   useEffect(() => {
      async function load() {
         setLoading(true)

         try {
            const res = await loadDashboardData(projectId, sprintId)

            setData({
               sprints: res.sprints,
               summary: res.summary,
               tasks: res.tasks,
               hours: res.hours,
               users: res.users,
               multiSprintTasks: res.multiSprintTasks ?? []
            })
         } catch (err) {
            console.error('Dashboard load failed', err)
         } finally {
            setLoading(false)
         }
      }

      load()
   }, [projectId, sprintId])

   return { ...data, loading }
}