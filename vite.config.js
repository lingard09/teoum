import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 배포 경로. Cloudflare Pages는 루트(/)로 서빙하므로 기본값이 '/'다.
  // GitHub Pages처럼 하위 경로로 서빙하는 곳은 빌드 시 VITE_BASE=/teoum/ 를 넘긴다.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    proxy: {
      // TourAPI(apis.data.go.kr)는 실제로 CORS 헤더를 내려줘서 배포본에서도 직접 호출이
      // 가능하지만(src/api/tourApiDetail.js 참고), 개발 서버에서는 같은 오리진으로 보이게 하는
      // 편의를 위해 프록시를 거친다.
      '/tourapi-proxy': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tourapi-proxy/, ''),
      },
    },
  },
})
