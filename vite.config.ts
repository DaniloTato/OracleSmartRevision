import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],

    server: {
        proxy: {
            '/api': {
                target: 'http://159.54.148.212',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
