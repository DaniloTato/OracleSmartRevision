import { apiClient } from './apiClient.js'
import { processOverdueTask } from './aiPipeline.js'

export function createCommands({
    reply,
    BASE_URL,
    AI_BASE_URL,
    PROJECT_ID,
    SPRINT_ID,
    DEFAULT_ASSIGNEE_ID,
    userState,
}) {
    function getSafeDueDate(task) {
        if (task.dueDate) return new Date(task.dueDate)
        return new Date()
    }

    return {
        start: (msg) => {
            reply(
                msg.chat.id,
                `
📌 *Comandos disponibles*

🗂️ /tasks
Muestra todas las tareas activas del sprint actual.

🆕 /create
Inicia el flujo para crear una nueva tarea (te pedirá el título).

✅ /complete <id>
Marca una tarea como completada (estado: closed).

👥 /users
Lista todos los usuarios disponibles en el sistema.

🧑‍💻 /assign <taskId> <userId>
Asigna una tarea a un usuario específico.

🔄 /status <taskId> <estado>
Cambia el estado de una tarea (ej: en_progreso, closed, open).

📋 /list_completed [sprintId] [userId]
Muestra tareas completadas, opcionalmente filtradas por sprint o usuario.

⚠️ /overdue <taskId>
Reporta una tarea vencida y solicita contexto para análisis posterior.

💡 Usa /help para ver esta lista nuevamente.
        `.trim(),
                { parse_mode: 'Markdown' }
            )
        },

        help: (msg) => {
            reply(
                msg.chat.id,
                `
📌 *Comandos disponibles*

🗂️ /tasks
Muestra todas las tareas activas del sprint actual.

🆕 /create
Inicia el flujo para crear una nueva tarea (te pedirá el título).

✅ /complete <id>
Marca una tarea como completada (estado: closed).

👥 /users
Lista todos los usuarios disponibles en el sistema.

🧑‍💻 /assign <taskId> <userId>
Asigna una tarea a un usuario específico.

🔄 /status <taskId> <estado>
Cambia el estado de una tarea (ej: en_progreso, closed, open).

📋 /list_completed [sprintId] [userId]
Muestra tareas completadas, opcionalmente filtradas por sprint o usuario.

⚠️ /overdue <taskId>
Reporta una tarea vencida y solicita contexto para análisis posterior.
        `.trim(),
                { parse_mode: 'Markdown' }
            )
        },

        users: async (msg) => {
            try {
                const { data } = await apiClient.get(`${BASE_URL}/users`)

                const text = data
                    .map((u) => `ID:${u.id} - ${u.name}`)
                    .join('\n')

                reply(msg.chat.id, text)
            } catch {
                reply(msg.chat.id, 'Error al obtener los usuarios')
            }
        },

        tasks: async (msg) => {
            try {
                const { data } = await apiClient.get(
                    `${BASE_URL}/projects/${PROJECT_ID}/issues`,
                    {
                        params: {
                            sprintId: SPRINT_ID,
                        },
                    }
                )

                if (!data.length) {
                    return reply(msg.chat.id, 'No hay tareas pendientes')
                }

                const text = data.map((t) => `#${t.id} - ${t.title}`).join('\n')

                reply(msg.chat.id, `Tareas:\n\n${text}`)
            } catch {
                reply(msg.chat.id, 'Error obteniendo tareas')
            }
        },

        create: (msg) => {
            const chatId = msg.chat.id

            userState[chatId] = {
                action: 'creating_task',
            }

            reply(chatId, 'Escribe el título de la tarea:')
        },

        complete: async (msg, args) => {
            try {
                await apiClient.patch(`${BASE_URL}/issues/${args[0]}`, {
                    status: 'closed',
                })

                reply(msg.chat.id, 'Tarea completada')
            } catch {
                reply(msg.chat.id, 'Error completando tarea')
            }
        },

        assign: async (msg, args) => {
            try {
                await apiClient.patch(`${BASE_URL}/issues/${args[0]}`, {
                    assigneeId: parseInt(args[1]),
                })

                reply(msg.chat.id, 'Asignado correctamente')
            } catch {
                reply(msg.chat.id, 'Error asignando')
            }
        },

        list_completed: async (msg, args) => {
            if (args.length > 2 || !args.length) {
                reply(msg.chat.id, 'Uso correcto: /list_completed [userId]')

                return
            }

            try {
                const params = {}

                params.sprintId = SPRINT_ID

                if (args[0]) {
                    params.assignedTo = args[0]
                }

                const { data } = await apiClient.get(
                    `${BASE_URL}/projects/${PROJECT_ID}/issues`,
                    { params }
                )

                const completedTasks = data.filter(
                    (task) => task.status === 'closed'
                )

                const text = completedTasks
                    .map((t) => `#${t.id} - ${t.title}`)
                    .join('\n')

                reply(
                    msg.chat.id,
                    `Tareas completas en sprint-id ${SPRINT_ID}:\n\n${text}`
                )
            } catch {
                reply(
                    msg.chat.id,
                    'Error mostrando tareas completas durante el sprint'
                )
            }
        },

        status: async (msg, args) => {
            try {
                await apiClient.patch(`${BASE_URL}/issues/${args[0]}`, {
                    status: args[1],
                })

                reply(msg.chat.id, 'Estado actualizado')
            } catch {
                reply(msg.chat.id, 'Error actualizando estado')
            }
        },

        overdue: async (msg, args) => {
            const chatId = msg.chat.id
            const taskId = args[0]

            if (!taskId || isNaN(taskId)) {
                return reply(chatId, 'Uso correcto: /overdue <taskId>')
            }

            userState[chatId] = {
                action: 'awaiting_reason',
                taskId,
            }

            try {
                const { data: task } = await apiClient.get(
                    `${BASE_URL}/issues/${taskId}`
                )

                const taskTitle = task?.title || `#${taskId}`

                userState[chatId] = {
                    action: 'awaiting_reason',
                    taskId,
                    taskTitle,
                }

                reply(
                    chatId,
                    `👋 Hola ${msg.from.first_name || 'de nuevo'}.\n\n` +
                        `Noté que la fecha de entrega de la tarea *"${taskTitle}"* ha sido superada.\n\n` +
                        `¿Podrías contarme brevemente qué ocurrió o qué bloqueó su entrega?\n\n` +
                        `Tu respuesta será utilizada para generar un reporte interno de seguimiento.`,
                    {
                        parse_mode: 'Markdown',
                    }
                )
            } catch (err) {
                console.error(err)

                reply(chatId, 'No pude obtener la información de la tarea 😅')
            }
        },

        handleCreatingTask: async (msg) => {
            const chatId = msg.chat.id

            try {
                await apiClient.post(
                    `${BASE_URL}/projects/${PROJECT_ID}/issues`,
                    {
                        title: msg.text,
                        description: '',
                        type: 'BUG',
                        status: 'open',
                        estimatedHours: 0,
                        actualHours: 0,
                        featureId: 6,
                        assigneeId: DEFAULT_ASSIGNEE_ID,
                        isVisible: true,
                    }
                )

                reply(chatId, 'Tarea creada')
            } catch {
                reply(chatId, 'Error creando tarea')
            } finally {
                delete userState[chatId]
            }
        },

        handleOverdueReason: async (msg, state) => {
            const chatId = msg.chat.id
            const reason = msg.text
            const taskId = state.taskId

            try {
                const { data: task } = await apiClient.get(
                    `${BASE_URL}/issues/${taskId}`
                )

                const formattedTask = {
                    ...task,
                    dueDate: getSafeDueDate(task),
                }

                await processOverdueTask(
                    formattedTask,
                    {
                        apiUrl: BASE_URL,
                        aiUrl: AI_BASE_URL,
                    },
                    reason
                )

                reply(
                    chatId,
                    `✅ Gracias, hemos registrado tu respuesta.\n\n` +
                        `Se generará un reporte de seguimiento para la tarea *"${state.taskTitle}"*.\n\n` +
                        `📌 Este reporte será compartido con el equipo responsable para análisis interno y mejora del proceso.\n\n` +
                        `Si necesitas apoyo para desbloquear este tipo de tareas, puedes contactar a tu manager o al equipo de soporte técnico.`,
                    {
                        parse_mode: 'Markdown',
                    }
                )
            } catch (err) {
                console.error(err)

                reply(chatId, 'Error generando reporte')
            } finally {
                delete userState[chatId]
            }
        },
    }
}
