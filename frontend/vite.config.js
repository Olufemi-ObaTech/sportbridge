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
    chunkSizeWarningLimit: 1000,
    cssMinify: false,
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
