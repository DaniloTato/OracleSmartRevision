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

import {
  getTasks,
  getMembers,
  getSprints,
  createTask,
  updateTask,
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

  const [taskIdsAssignedViaAI] = useState<Set<number>>(new Set())

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
        const [tasksRes, membersRes, sprintsRes] = await Promise.all([
          getTasks(projectId),
          getMembers(projectId),
          getSprints(projectId),
        ])

        setTasks(tasksRes)
        setMembers(membersRes)
        setSprints(sprintsRes)

        const activeSprint =
          sprintsRes.find((s: any) => s.status === 'active')?.id ??
          sprintsRes?.[0]?.id ??
          ''

        // normalize sprintId as string (IMPORTANT)
        setFilters((f) => ({ ...f, sprintId: String(activeSprint) }))
      } finally {
        setLoading(false)
      }
    }

    load()
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

    const parsedId =
      typeof rawId === 'string' ? rawId : String(rawId)

    const updatedAssignee = isPool
      ? null
      : Number(parsedId)

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

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      )

      await updateTask(taskId, { status })
    },
    []
  )

  /* =========================
     CREATE TASK
  ========================== */
  const handleCreateTask = useCallback(
    async (task: Omit<Task, 'id' | 'createdAt'>) => {
      const created = await createTask(projectId, task)

      setTasks((prev) => [...prev, created])
      setCreateModalOpen(false)
    },
    [projectId]
  )

  /* =========================
     FILTERS
  ========================== */

  const poolTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.assigneeId == null &&
          (filters.sprintId === '' ||
            String(t.sprintId) === filters.sprintId) &&
          (filters.tipo === '' || t.type === filters.tipo) &&
          (filters.prioridad === '' || t.priority === filters.prioridad) &&
          (filters.estado === '' || t.status === filters.estado)
      ),
    [tasks, filters]
  )

  const boardTasksBySprint = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.assigneeId != null &&
          (filters.sprintId === '' ||
            String(t.sprintId) === filters.sprintId)
      ),
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
                poolId={POOL_ID}
                highlightedTaskId={highlightedTaskId}
                taskIdsAssignedViaAI={taskIdsAssignedViaAI}
              />

              <TeamBoard
                tasks={boardTasksBySprint}
                members={members}
                onUpdateStatus={handleUpdateTaskStatus}
                highlightedTaskId={highlightedTaskId}
                taskIdsAssignedViaAI={taskIdsAssignedViaAI}
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