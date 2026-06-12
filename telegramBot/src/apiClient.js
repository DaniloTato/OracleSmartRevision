import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
const TOKEN = process.env.SERVICE_API_TOKEN || 'fake-token'

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    },
})
