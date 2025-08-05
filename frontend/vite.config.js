// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': 'sciolyhub.vercel.app',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
