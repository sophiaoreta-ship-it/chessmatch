import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173, // Default Vite port
    strictPort: false, // Try next available port if 5173 is taken
  },
})



