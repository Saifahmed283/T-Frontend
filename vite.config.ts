import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import vike from "vike/plugin"
import path from "node:path"

export default defineConfig({
  plugins: [react(), vike(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8443,
    strictPort: true,
    proxy: {
      // Same-origin /api in dev keeps the httpOnly session cookie working
      // without CORS. Override the backend with VITE_PROXY_TARGET.
      "/api": {
        target: process.env.VITE_PROXY_TARGET ?? "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 8443,
  },
  build: {
    sourcemap: false,
    target: "es2020",
    chunkSizeWarningLimit: 800,
  },
})
