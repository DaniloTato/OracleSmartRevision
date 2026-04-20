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
  deleteTask
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
  const highlightedTaskId = searchParams.get('taskId') ? Number(searchParams.get('taskId')) : undefined

  /* =========================
     LOAD DATA
  ========================== */
  useEffect(() => {
    async function load() {
      setLoading(true)

      try {
        const { tasks, members, sprints } = await loadTaskManagerData(projectId)

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
  const handleDragEnd = useCallback(async (event: any) => {
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

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assigneeId: updatedAssignee } : t
      )
    )

    await updateTask(taskId, {
      assigneeId: updatedAssignee,
    })

    console.log('PATCH SENT:', {
      taskId,
      assigneeId: updatedAssignee,
      rawTarget: rawId,
    })
  }, [])

  /* =========================
     STATUS UPDATE
  ========================== */
  const handleUpdateTaskStatus = useCallback(
    async (taskId: number, status: TaskStatus) => {
      const id = Number(taskId)

      console.log("CHANGED STATUS", taskId, status)

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      )

      await updateTask(taskId, { status })
    },
    []
  )

  /* =========================
     DELETE TASK
  ========================== */
  const handleDeleteTask = useCallback(async (taskId: number) => {
    // optimistic UI update
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      await deleteTask(taskId)
    } catch (err: any) {
      console.error('❌ DELETE FAILED:', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        raw: err,
      })
    }
  }, [])

  /* =========================
     CREATE TASK
  ========================== */
  const handleCreateTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const payload = {
      title: task.title,
      description: "string",
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

    //MODIFY THIS HORRIBLE PIECE OF CODE ONCE BACKEND RESPONDS CORRECTLY
    setTasks((prev) => [
      ...prev,
      {
        ...task,
        id: Date.now(), // temporary ID
        createdAt: new Date().toISOString(),
        sprintId: selectedSprintId,
      }
    ])

    await createTask(projectId, payload)

  }, [projectId, loadTasks])

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