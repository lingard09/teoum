import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 서비스키는 더 이상 번들에 넣지 않는다(브라우저 코드가 참조하지 않으므로
  // Vite도 인라인하지 않는다). 개발 서버에서만 여기서 읽어 프록시가 붙여준다.
  const env = loadEnv(mode, process.cwd(), '')
  const serviceKey = env.VITE_TOUR_API_KEY ?? ''

  return {
    // Cloudflare Pages는 루트(/)로 서빙한다. 하위 경로로 서빙하는 호스팅으로
    // 옮기게 되면 여기를 바꾸면 된다(라우터는 import.meta.env.BASE_URL을 따라감).
    base: '/',
    plugins: [react()],
    server: {
      proxy: {
        // 배포본에서는 Cloudflare Function(functions/api/tour)이 이 경로를 받아
        // 키를 붙이고 엣지에 하루 캐시한다. vite dev에는 Functions가 없으므로
        // 같은 경로를 흉내 내 준다 — 캐시는 없지만 앱 코드는 그대로 돈다.
        '/api/tour': {
          target: 'https://apis.data.go.kr',
          changeOrigin: true,
          rewrite: (path) => {
            const [pathname, search = ''] = path.replace(/^\/api\/tour/, '').split('?')
            const params = new URLSearchParams(search)
            params.set('serviceKey', serviceKey)
            return `${pathname}?${params.toString()}`
          },
        },
      },
    },
  }
})
