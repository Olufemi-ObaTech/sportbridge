import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Raise chunk warning threshold (bundle is a single SPA, expected to be large)
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Security: restrict access during dev
    headers: {
      'X-Content-Type-Options':    'nosniff',
      'X-Frame-Options':           'SAMEORIGIN',
      'Referrer-Policy':           'strict-origin-when-cross-origin',
    },
  },
})
