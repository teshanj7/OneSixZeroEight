import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages, set BASE to '/<repo-name>/' before building/deploying
const BASE = process.env.VITE_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base: BASE
})
