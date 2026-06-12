import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // allows access from mobile
    port: 3000,  // optional, default 5173
  },
})
