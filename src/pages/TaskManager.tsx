import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

import type { CreateTaskDto, Task, TaskStatus, TaskType } from '../types/Task'
import type { Member } from '../types'

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
        estado: '' as '' | TaskStatus,
        sprintId: '',
    })

    const [createModalOpen, setCreateModalOpen] = useState(false)

    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)

    const [closingTaskId, setClosingTaskId] = useState<number | null>(null)
    const [realHours, setRealHours] = useState<number>(0)

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
            if (status === 'closed') {
                setClosingTaskId(taskId)
                return
            }

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
    const handleAskDeleteConfirmation = useCallback(async (taskId: number) => {
        setDeletingTaskId(taskId)
    }, [])

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
        async (task: CreateTaskDto) => {
            const payload = {
                title: task.title,
                description: task.description,
                type: task.type,
                status: task.status,
                estimatedHours: task.estimatedHours,
                actualHours: 0,
                featureId: task.featureId,
                assigneeId: task.assigneeId,
                isVisible: task.isVisible,
                dueDate: task.dueDate
            }

            console.log("payload due date", task.dueDate)

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
                                onDeleteTask={handleAskDeleteConfirmation}
                                poolId={POOL_ID}
                                highlightedTaskId={highlightedTaskId}
                            />

                            <TeamBoard
                                tasks={boardTasksBySprint}
                                members={members}
                                onUpdateStatus={handleUpdateTaskStatus}
                                onDeleteTask={handleAskDeleteConfirmation}
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

            {closingTaskId && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[320px] space-y-4">
                        <h2 className="text-lg font-semibold">
                            Registrar horas reales
                        </h2>

                        <input
                            type="number"
                            className="w-full border rounded p-2"
                            placeholder="Horas reales"
                            value={realHours}
                            onChange={(e) =>
                                setRealHours(Number(e.target.value))
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setClosingTaskId(null)
                                    setRealHours(0)
                                }}
                            >
                                Cancelar
                            </Button>

                            <Button
                                onClick={async () => {
                                    try {
                                        await updateTask(closingTaskId, {
                                            status: 'closed',
                                            actualHours: realHours,
                                        })

                                        await loadTasks()
                                    } catch (err) {
                                        console.error('CLOSE TASK FAILED:', err)
                                    } finally {
                                        setClosingTaskId(null)
                                        setRealHours(0)
                                    }
                                }}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deletingTaskId && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[320px] space-y-4">
                        <h2 className="text-lg font-semibold">
                            ¿Eliminar tarea?
                        </h2>
                        <p className="text-sm text-gray-500">
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setDeletingTaskId(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (deletingTaskId !== null) {
                                        handleDeleteTask(deletingTaskId)
                                        setDeletingTaskId(null)
                                    }
                                }}
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
