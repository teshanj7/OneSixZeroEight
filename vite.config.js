// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/OneSixZeroEight/', // <-- change to your repo name EXACTLY (case-sensitive)
  plugins: [react()],
})
