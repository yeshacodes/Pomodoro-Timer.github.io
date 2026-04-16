import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Pomodoro-Timer.github.io/',
  plugins: [react()],
})
