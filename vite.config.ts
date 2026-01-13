import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 8080, // 포트 충돌 회피
    host: true,
    strictPort: false, // 포트가 사용 중이면 다른 포트 찾기
  },
})
