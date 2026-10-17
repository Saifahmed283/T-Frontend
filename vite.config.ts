import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8443,
    strictPort: true,
    proxy: {
      // Same-origin /api in dev keeps the httpOnly session cookie working
      // without CORS. Override the backend with VITE_PROXY_TARGET.
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 8443,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor'
            return 'vendor'
          }
          if (id.includes('/pages/dashboard/')) return 'dashboard'
          if (id.includes('/pages/site/')) return 'site'
          if (id.includes('/content/')) return 'content'
        },
      },
    },
  },
})