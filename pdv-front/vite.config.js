import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@phosphor-icons/react'],
          'vendor-http': ['axios'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-chart': ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
