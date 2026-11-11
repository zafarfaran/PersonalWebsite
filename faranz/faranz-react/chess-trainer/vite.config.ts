import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base './' keeps every asset path relative, so the built app works from any
// folder (faranz.com/chess/, a subdomain, or a local file server).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
