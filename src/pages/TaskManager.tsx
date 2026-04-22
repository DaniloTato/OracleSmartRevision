import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

import type { Task, TaskStatus, TaskType, TaskPriority, Member } from '../types'

import { TaskPool } from '../components/task-manager/TaskPool'
import { TeamBoard } from '../components/task-manager/TeamBoard'
import { CreateTaskModal } from '../components/task-manager/CreateTaskModal'

import { Section } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ChartPlaceholder } from '../components/ui/ChartPlaceholder'

import { filterPoolTasks, filterBoardTasks } from '../utils/taskManager/filters'

import { useSprint } from '../context/SprintContext'
import { loadTaskManagerData } from '../services/taskManager'
import { getUpdatedAssignee } from '../utils/taskManager/dnd'

import {
   getTasks,
   createTask,
   updateTask,
   deleteTask,
} from '../api/taskManagerApi'

const POOL_ID = 'pool'

export function TaskManager() {
   const projectId = 1

   const [tasks, setTasks] = useState<Task[]>([])
   const [members, setMembers] = useState<Member[]>([])
   const [sprints, setSprints] = useState<any[]>([])

   const [loading, setLoading] = useState(true)

   const [filters, setFilters] = useState({
      tipo: '' as '' | TaskType,
      prioridad: '' as '' | TaskPriority,
      estado: '' as '' | TaskStatus,
      sprintId: '',
   })

   const [createModalOpen, setCreateModalOpen] = useState(false)

   const { selectedSprintId } = useSprint()

   const [searchParams] = useSearchParams()
   const filterUnassignedFromUrl = searchParams.get('filter') === 'unassigned'
   const highlightedTaskId = searchParams.get('taskId')
      ? Number(searchParams.get('taskId'))
      : undefined

   /* =========================
     LOAD DATA
  ========================== */
   useEffect(() => {
      async function load() {
         setLoading(true)

         try {
            const { tasks, members, sprints } =
               await loadTaskManagerData(projectId)

            setTasks(tasks)
            setMembers(members)
            setSprints(sprints)
         } finally {
            setLoading(false)
         }
      }

      load()
   }, [projectId])

   useEffect(() => {
      if (!selectedSprintId) return

      setFilters((f) => ({
         ...f,
         sprintId: String(selectedSprintId),
      }))
   }, [selectedSprintId])

   const loadTasks = useCallback(async () => {
      const tasksRes = await getTasks(projectId)
      setTasks(tasksRes)
   }, [projectId])

   /* =========================
     DRAG & DROP
  ========================== */
   const handleDragEnd = useCallback(
      async (event: any) => {
         const { active, over } = event
         if (!over) return

         const taskId = Number(active.id)
         const rawId = over.id
         const isPool = rawId === POOL_ID

         const updatedAssignee = getUpdatedAssignee(over.id, POOL_ID)

         if (!isPool && Number.isNaN(updatedAssignee)) {
            console.error('Invalid assignee id:', rawId)
            return
         }

         try {
            await updateTask(taskId, {
               assigneeId: updatedAssignee,
            })

            await loadTasks()
         } catch (err) {
            console.error('ASSIGN UPDATE FAILED:', err)
         }
      },
      [loadTasks]
   )

   /* =========================
     STATUS UPDATE
  ========================== */
   const handleUpdateTaskStatus = useCallback(
      async (taskId: number, status: TaskStatus) => {
         try {
            await updateTask(taskId, { status })

            await loadTasks()
         } catch (err) {
            console.error('STATUS UPDATE FAILED:', err)
         }
      },
      [loadTasks]
   )

   /* =========================
     DELETE TASK
  ========================== */
   const handleDeleteTask = useCallback(
      async (taskId: number) => {
         try {
            await deleteTask(taskId)
            await loadTasks()
         } catch (err) {
            console.error('DELETE FAILED:', err)
         }
      },
      [loadTasks]
   )

   const handleCreateTask = useCallback(
      async (task: Omit<Task, 'id' | 'createdAt'>) => {
         const payload = {
            title: task.title,
            description: 'string',
            type: task.type,
            status: task.status,
            estimatedHours: task.estimatedHours,
            actualHours: task.estimatedHours,
            featureId: task.featureId,
            assigneeId: task.assigneeId,
            isVisible: task.isVisible,
            sprintId: selectedSprintId,
         }

         setCreateModalOpen(false)

         try {
            const created = await createTask(projectId, payload)

            if (created) {
               setTasks((prev) => [...prev, created])
            } else {
               await loadTasks()
            }
         } catch (err) {
            console.error('CREATE TASK FAILED:', err)
         }
      },
      [projectId, selectedSprintId, loadTasks]
   )

   /* =========================
     FILTERS
  ========================== */

   const poolTasks = useMemo(
      () => filterPoolTasks(tasks, filters),
      [tasks, filters]
   )

   const boardTasksBySprint = useMemo(
      () => filterBoardTasks(tasks, filters),
      [tasks, filters]
   )

   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
   )

   if (loading) {
      return <ChartPlaceholder message="Cargando tareas..." />
   }

   return (
      <div className="space-y-6">
         <Section>
            <div className="flex flex-wrap items-center justify-between gap-3">
               <h1 className="text-2xl font-semibold">Gestor de Tareas</h1>

               <Button onClick={() => setCreateModalOpen(true)}>
                  Crear Tarea
               </Button>
            </div>
         </Section>

         {filterUnassignedFromUrl && (
            <Badge variant="warning">Vista: Tareas sin asignar</Badge>
         )}

         <Section>
            {tasks.length === 0 ? (
               <ChartPlaceholder message="No hay tareas aún" />
            ) : (
               <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,360px)_1fr] gap-4">
                     <TaskPool
                        tasks={poolTasks}
                        sprints={sprints}
                        filters={filters}
                        onFiltersChange={setFilters}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onDeleteTask={handleDeleteTask}
                        poolId={POOL_ID}
                        highlightedTaskId={highlightedTaskId}
                     />

                     <TeamBoard
                        tasks={boardTasksBySprint}
                        members={members}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onDeleteTask={handleDeleteTask}
                        highlightedTaskId={highlightedTaskId}
                     />
                  </div>
               </DndContext>
            )}
         </Section>

         {createModalOpen && (
            <CreateTaskModal
               sprints={sprints}
               members={members}
               onClose={() => setCreateModalOpen(false)}
               onSubmit={handleCreateTask}
            />
         )}
      </div>
   )
}
