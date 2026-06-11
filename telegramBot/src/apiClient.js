import axios from 'axios'

import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = process.env.API_BASE_URL

const TOKEN = process.env.SERVICE_API_TOKEN

if (!BASE_URL) throw new Error('Missing API_BASE_URL')

if (!TOKEN) throw new Error('Missing SERVICE_API_TOKEN')

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    },
})
