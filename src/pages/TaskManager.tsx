import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'

import type { CreateTaskDto, Task, TaskStatus, TaskType } from '../types/Task'
import type { Member, Sprint } from '../types'

import { TeamBoard } from '../components/task-manager/TeamBoard'
import { CreateTaskModal } from '../components/task-manager/CreateTaskModal'

import { Section } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ChartPlaceholder } from '../components/ui/ChartPlaceholder'

import { filterBoardTasks } from '../utils/taskManager/filters'

import { loadTaskManagerData } from '../services/taskManager'
import { getUpdatedAssignee } from '../utils/taskManager/dnd'
import { SemanticSearch } from '../components/task-manager/SemanticSearch'

import { Select } from '../components/ui/Select'

import { reindexEmbeddings } from '../api/vectorSearchApi'

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
    const [sprints, setSprints] = useState<Sprint[]>([])
    const [semanticMatches, setSemanticMatches] = useState<number[] | null>(
        null
    )

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

    const [searchParams] = useSearchParams()
    const filterUnassignedFromUrl = searchParams.get('filter') === 'unassigned'

    const bestMatchId = semanticMatches?.[0] ?? null

    const TOP_N = 5

    const semanticSet = useMemo(() => {
        return new Set((semanticMatches ?? []).slice(0, TOP_N))
    }, [semanticMatches])

    const loadTasks = useCallback(async () => {
        const tasksRes = await getTasks(projectId)
        setTasks(tasksRes)
    }, [projectId])

    /* =========================
     LOAD DATA
  ========================== */

    useEffect(() => {
        if (sprints.length > 0) {
            setFilters((prev) => ({
                ...prev,
                sprintId: String(sprints[0].id),
            }))
        }
    }, [sprints])

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

    const refreshEmbeddings = useCallback(async () => {
        try {
            await reindexEmbeddings(projectId)
        } catch (err) {
            console.error('EMBEDDING REINDEX FAILED', err)
        }
    }, [projectId])

    /* =========================
     DRAG & DROP
  ========================== */
    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
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
                await refreshEmbeddings()
            } catch (err) {
                console.error('DELETE FAILED:', err)
            }
        },
        [loadTasks, refreshEmbeddings]
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
                dueDate: task.dueDate,
            }

            console.log('payload due date', task.dueDate)

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
        [projectId, loadTasks]
    )

    /* =========================
     FILTERS
  ========================== */

    const searchedTasks = useMemo(() => {
        if (!semanticMatches) return tasks

        const set = new Set(semanticMatches)
        return tasks.filter((task) => set.has(task.id))
    }, [tasks, semanticMatches])

    const boardTasksBySprint = useMemo(
        () => filterBoardTasks(searchedTasks, filters),
        [searchedTasks, filters]
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
                    <h1
                        data-testid="task-manager-title"
                        className="text-2xl font-semibold"
                    >
                        Gestor de Tareas
                    </h1>

                    <Button onClick={() => setCreateModalOpen(true)}>
                        Crear Tarea
                    </Button>
                </div>
            </Section>

            {filterUnassignedFromUrl && (
                <Badge variant="warning">Vista: Tareas sin asignar</Badge>
            )}

            <Section>
                <div className="flex items-center gap-8 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Sprint</label>

                        <Select
                            data-testid="sprint-filter"
                            value={filters.sprintId}
                            onChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    sprintId: value,
                                }))
                            }
                            options={[
                                {
                                    value: '',
                                    label: 'Todos los sprints',
                                },
                                ...sprints.map((sprint) => ({
                                    value: String(sprint.id),
                                    label: sprint.name,
                                })),
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Estado</label>

                        <Select
                            data-testid="status-filter"
                            value={filters.estado}
                            onChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    estado: value as '' | TaskStatus,
                                }))
                            }
                            options={[
                                {
                                    value: '',
                                    label: 'Todos los estados',
                                },
                                {
                                    value: 'open',
                                    label: 'Abiertas',
                                },
                                {
                                    value: 'in_progress',
                                    label: 'En progreso',
                                },
                                {
                                    value: 'closed',
                                    label: 'Cerradas',
                                },
                            ]}
                        />
                    </div>
                </div>
            </Section>

            <Section>
                {tasks.length === 0 ? (
                    <ChartPlaceholder message="No hay tareas aún" />
                ) : (
                    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
                        <div className="space-y-4">
                            <SemanticSearch
                                data-testid="semantic-search"
                                projectId={projectId}
                                onResultsChange={setSemanticMatches}
                                placeholder="Search tasks semantically..."
                            />
                            <TeamBoard
                                tasks={boardTasksBySprint}
                                members={members}
                                onUpdateStatus={handleUpdateTaskStatus}
                                onDeleteTask={handleAskDeleteConfirmation}
                                bestMatchId={bestMatchId}
                                semanticSet={semanticSet}
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
                    selectedSprintId={Number(filters.sprintId)}
                />
            )}

            {closingTaskId && (
                <div
                    data-testid="close-task-modal"
                    className="fixed inset-0 bg-black/30 flex items-center justify-center"
                >
                    <div className="bg-white rounded-xl p-6 w-[320px] space-y-4">
                        <h2
                            data-testid="register-hours-title"
                            className="text-lg font-semibold"
                        >
                            Registrar horas reales
                        </h2>

                        <input
                            data-testid="actual-hours-input"
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
                                data-testid="cancel-close-task"
                                variant="ghost"
                                onClick={() => {
                                    setClosingTaskId(null)
                                    setRealHours(0)
                                }}
                            >
                                Cancelar
                            </Button>

                            <Button
                                data-testid="confirm-close-task"
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
                <div
                    data-testid="modal-backdrop"
                    className="fixed inset-0 bg-black/30 flex items-center justify-center"
                >
                    <div className="bg-white rounded-xl p-6 w-[320px] space-y-4">
                        <h2
                            data-testid="delete-task-title"
                            className="text-lg font-semibold"
                        >
                            ¿Eliminar tarea?
                        </h2>
                        <p
                            data-testid="delete-task-message"
                            className="text-sm text-gray-500"
                        >
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                data-testid="cancel-delete-task"
                                variant="ghost"
                                onClick={() => setDeletingTaskId(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                data-testid="confirm-delete-task"
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
