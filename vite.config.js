import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages는 https://<user>.github.io/teoum/ 하위 경로로 서빙됨
  base: '/teoum/',
  plugins: [react()],
})
