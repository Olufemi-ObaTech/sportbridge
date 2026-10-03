import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pin the project root so the build works whether invoked from inside
  // frontend/ or from the repository root (e.g. `vite --config frontend/vite.config.js`).
  root: '.',
  // The public/ directory contains static assets (favicon, og-image, etc.)
  // that are copied verbatim to dist/ without hashing.
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
