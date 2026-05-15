import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

import { createCommands } from './commands.js'

dotenv.config()

const TOKEN = process.env.TELEGRAM_TOKEN
const BASE_URL = process.env.API_BASE_URL
const AI_BASE_URL = process.env.AI_BASE_URL

const PROJECT_ID = process.env.PROJECT_ID || 1
const SPRINT_ID = 3
const DEFAULT_ASSIGNEE_ID = 105

if (!TOKEN || !BASE_URL) {
    console.error('Faltan variables de entorno')
    process.exit(1)
}

const bot = new TelegramBot(TOKEN, { polling: true })

const reply = (id, msg, opts = {}) => bot.sendMessage(id, msg, opts)

const userState = {}

const commands = createCommands({
    reply,
    BASE_URL,
    AI_BASE_URL,
    PROJECT_ID,
    SPRINT_ID,
    DEFAULT_ASSIGNEE_ID,
    userState,
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const text = msg.text

    if (!text) return

    const state = userState[chatId]

    if (state?.action === 'creating_task') {
        await commands.handleCreatingTask(msg)
        return
    }

    if (state?.action === 'awaiting_reason') {
        await commands.handleOverdueReason(msg, state)
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

bot.setMyCommands([
    {
        command: 'tasks',
        description: 'Ver tareas pendientes',
    },
    {
        command: 'users',
        description: 'Ver usuarios',
    },
    {
        command: 'create',
        description: 'Crear nueva tarea',
    },
    {
        command: 'overdue',
        description: 'Generar reporte de tarea atrasada',
    },
    {
        command: 'list_completed',
        description: 'Objetener tareas completadas por sprint',
    },
])

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message || err)
})

console.log('Bot listo')
