import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    open: true,
    port: 5520,
    host: true,
  },
  plugins: [react()],
})
