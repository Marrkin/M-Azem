import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: '.',
  build: {
    outDir: 'public',
    emptyOutDir: true
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '5173'),
    strictPort: false,
    proxy: {
      '/api': `http://localhost:${process.env.PORT || 5000}`
    }
  }
})
