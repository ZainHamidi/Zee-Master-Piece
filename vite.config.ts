import { getRequestListener } from '@hono/node-server'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Make server-only settings from .env.local (MONGODB_URI, RESEND_API_KEY…) available to the dev API.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ''))) process.env[key] ??= value
  return { plugins: [react(), devApi()] }
})

// Serves /api/* from server/app.ts during `npm run dev`, so the site and API run with one command.
// On Vercel the same app runs from api/index.ts instead.
function devApi(): Plugin {
  return {
    name: 'zee-dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        server
          .ssrLoadModule('/server/app.ts')
          .then(({ app }) => getRequestListener(app.fetch)(req, res))
          .catch(next)
      })
    },
  }
}
