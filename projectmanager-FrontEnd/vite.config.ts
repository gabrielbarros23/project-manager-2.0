import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // O JWT vive num cookie httpOnly. Chamando a API pelo mesmo origin (/api) o navegador
      // envia o cookie sem precisar de CORS.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:3333',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
