import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import axios from 'axios'
import { processOverdueTask } from "./aiPipeline.js"

dotenv.config()

const TOKEN = process.env.TELEGRAM_TOKEN
const BASE_URL = process.env.API_BASE_URL
const AI_BASE_URL = process.env.AI_BASE_URL

const PROJECT_ID = process.env.PROJECT_ID || 1
const SPRINT_ID = 1
const DEFAULT_ASSIGNEE_ID = 105

if (!TOKEN || !BASE_URL) {
    console.error('Faltan variables de entorno')
    process.exit(1)
}

const bot = new TelegramBot(TOKEN, { polling: true })
const reply = (id, msg) => bot.sendMessage(id, msg)

const userState = {}

function getSafeDueDate(task) {
    if (task.dueDate) return new Date(task.dueDate)
    return new Date()
}

// ================= COMMAND HANDLERS =================

const commands = {
    start: (msg) => {
        reply(
            msg.chat.id,
            `
Comandos:
/tasks
/create
/complete 1
/users
/assign 1 101
/status 1 en_progreso
`.trim()
        )
    },

    help: (msg) => commands.start(msg),

    users: async (msg) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/users`)
            const text = data.map((u) => `ID:${u.id} - ${u.name}`).join('\n')
            reply(msg.chat.id, text)
        } catch {
            reply(msg.chat.id, 'Error al obtener los usuarios')
        }
    },

    tasks: async (msg) => {
        try {
            const { data } = await axios.get(
                `${BASE_URL}/projects/${PROJECT_ID}/issues`,
                { params: { sprintId: SPRINT_ID } }
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
        userState[chatId] = { action: 'creating_task' }
        reply(chatId, 'Escribe el título de la tarea:')
    },

    complete: async (msg, args) => {
        try {
            await axios.patch(`${BASE_URL}/issues/${args[0]}`, {
                status: 'closed',
            })
            reply(msg.chat.id, 'Tarea completada')
        } catch {
            reply(msg.chat.id, 'Error completando tarea')
        }
    },

    assign: async (msg, args) => {
        try {
            await axios.patch(`${BASE_URL}/issues/${args[0]}`, {
                assigneeId: parseInt(args[1]),
            })
            reply(msg.chat.id, 'Asignado correctamente')
        } catch {
            reply(msg.chat.id, 'Error asignando')
        }
    },

    status: async (msg, args) => {
        try {
            await axios.patch(`${BASE_URL}/issues/${args[0]}`, {
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
            return reply(chatId, '⚠️ Uso correcto: /overdue <taskId>')
        }
        userState[chatId] = {
            action: 'awaiting_reason',
            taskId
        }
        reply(chatId, '✍️ Escribe la razón del atraso:')
    }
}

// ================= MAIN MESSAGE HANDLER =================

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const text = msg.text

    if (!text) return

    const state = userState[chatId]
    if (state?.action === 'creating_task') {
        try {
            await axios.post(`${BASE_URL}/projects/${PROJECT_ID}/issues`, {
                title: text,
                description: '',
                type: 'BUG',
                status: 'closed',
                estimatedHours: 0,
                actualHours: 0,
                featureId: 2,
                assigneeId: DEFAULT_ASSIGNEE_ID,
                isVisible: true,
            })

            reply(chatId, 'Tarea creada')
        } catch {
            reply(chatId, 'Error creando tarea')
        } finally {
            delete userState[chatId]
        }

        return
    }

    if (state?.action === 'awaiting_reason') {
        const reason = text
        const taskId = state.taskId

        try {
            const { data: task } = await axios.get(
                `${BASE_URL}/issues/${taskId}`
            )

            const formattedTask = {
                ...task,
                dueDate: getSafeDueDate(task),
            }

            console.log('TASK PASSED TO PIPELINE:', formattedTask)

            await processOverdueTask(formattedTask, {
                apiUrl: BASE_URL,
                aiUrl: AI_BASE_URL
            }, reason)

            reply(chatId, `Reporte generado para tarea #${taskId}`)
        } catch (err) {
            console.error(err)
            reply(chatId, '❌ Error generando reporte')
        } finally {
            delete userState[chatId]
        }

        return
    }

    if (text.startsWith('/')) {
        const [cmd, ...args] = text.slice(1).split(' ')

        if (commands[cmd]) {
            return commands[cmd](msg, args)
        }

        return reply(
            chatId,
            'Comando no reconocido 🤔\nUsa /help para ver opciones.'
        )
    }

    reply(chatId, 'No entendí ese mensaje 😅\nUsa /help para ver comandos.')
})

// ================= INIT =================

bot.setMyCommands([
    { command: 'tasks', description: 'Ver tareas pendientes' },
    { command: 'users', description: 'Ver usuarios' },
    { command: 'create', description: 'Crear nueva tarea' },
    { command: 'overdue', description: 'Generar reporte de tarea atrasada' }
])

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message || err)
})

console.log('Bot listo')