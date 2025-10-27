import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split large vendor libraries into separate chunks
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('@fullcalendar')) return 'vendor-fullcalendar';
            if (id.includes('chart.js') || id.includes('chartjs')) return 'vendor-charts';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
            // All other node_modules go into a general vendor chunk
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
