require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = process.env.API_BASE_URL;

//Valores hardcodeados para testing.
const PROJECT_ID = process.env.PROJECT_ID || 1;
const SPRINT_ID = 1; 
const DEFAULT_ASSIGNEE_ID = 105; // Por el momento id de Yael para pruebas. A futuro cambiar

if (!TOKEN || !BASE_URL) {
  console.error('Faltan variables de entorno');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
const reply = (id, msg) => bot.sendMessage(id, msg);

// Estado temporal por usuario para flujos conversacionales
const userState = {};

// MENU DE COMANDOS (aparece en el botón ☰ de Telegram)
bot.setMyCommands([
  { command: 'tasks',  description: 'Ver tareas pendientes' },
  { command: 'users',  description: 'Ver usuarios' },
  { command: 'create', description: 'Crear nueva tarea' },
]).catch(err => console.error('Error registrando comandos:', err.message));

// HELP
bot.onText(/\/start|\/help/, (msg) => {
  reply(msg.chat.id, `
Comandos:
/tasks
/create
/complete 1
/users
/assign 1 101
/status 1 en_progreso
`.trim());
});

// USERS
bot.onText(/\/users/, async (msg) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/users`);
    const text = data.map(u => `ID:${u.id} - ${u.name}`).join('\n');
    reply(msg.chat.id, text);
  } catch (err) {
    reply(msg.chat.id, 'Error al obtener los usuarios');
    console.error(err.response?.data || err.message);
  }
});

// TASKS
bot.onText(/\/tasks/, async (msg) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/projects/${PROJECT_ID}/issues`,
      { params: { sprintId: SPRINT_ID } }
    );
    const tasks = data; //Para próximos filtros puede ser como data.filter(t => t.status !== 'closed') pero para pruebas mostrar todas.
    if (!tasks.length) {
      return reply(msg.chat.id, 'No hay tareas pendientes');
    }
    const text = tasks.map(t => `#${t.id} - ${t.title}`).join('\n');
    reply(msg.chat.id, `Tareas:\n\n${text}`);
  } catch (err) {
    reply(msg.chat.id, 'Error obteniendo tareas');
    console.error(err.response?.data || err.message);
  }
});

// CREATE — inicia el flujo conversacional
bot.onText(/\/create$/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = { action: 'creating_task' };
  reply(chatId, 'Escribe el título de la tarea:');
});

// COMPLETE
bot.onText(/\/complete (\d+)/, async (msg, match) => {
  try {
    await axios.patch(`${BASE_URL}/issues/${match[1]}`, { status: 'closed' });
    reply(msg.chat.id, 'Tarea completada');
  } catch (err) {
    reply(msg.chat.id, 'Error completando tarea');
    console.error(err.response?.data || err.message);
  }
});

// ASSIGN
bot.onText(/\/assign (\d+) (\d+)/, async (msg, match) => {
  try {
    await axios.patch(`${BASE_URL}/issues/${match[1]}`, {
      assigneeId: parseInt(match[2])
    });
    reply(msg.chat.id, 'Asignado correctamente');
  } catch (err) {
    reply(msg.chat.id, 'Error asignando');
    console.error(err.response?.data || err.message);
  }
});

// STATUS
bot.onText(/\/status (\d+) (\S+)/, async (msg, match) => {
  try {
    await axios.patch(`${BASE_URL}/issues/${match[1]}`, { status: match[2] });
    reply(msg.chat.id, 'Estado actualizado');
  } catch (err) {
    reply(msg.chat.id, 'Error actualizando estado');
    console.error(err.response?.data || err.message);
  }
});

// CAPTURA DE MENSAJES — maneja flujos conversacionales activos
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!msg.text || msg.text.startsWith('/')) return;

  const state = userState[chatId];
  if (!state) return;

  if (state.action === 'creating_task') {
    try {
      const payload = {
        title: msg.text,
        description: '',
        type: 'BUG',
        status: 'closed',
        estimatedHours: 0,
        actualHours: 0,
        featureId: null,
        assigneeId: DEFAULT_ASSIGNEE_ID,
        isVisible: true
      };

      console.log('Creando tarea con payload:', JSON.stringify(payload));

      const { data } = await axios.post(
        `${BASE_URL}/projects/${PROJECT_ID}/issues`,
        payload
      );

      console.log('Tarea creada:', JSON.stringify(data));
      reply(chatId, `Tarea #${data.id} creada`);
    } catch (err) {
      console.error('Status:', err.response?.status);
      console.error('Error:', JSON.stringify(err.response?.data) || err.message);
      reply(chatId, 'Error creando tarea');
    } finally {
      delete userState[chatId];
    }
  }
});

// Capturar promises no manejadas globalmente
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message || err);
});

console.log('Bot listo');