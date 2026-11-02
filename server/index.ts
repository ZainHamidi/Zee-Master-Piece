// Runs the whole site as one Node server (see deploy/): the API from ./app plus the built frontend
// from dist/. On Vercel, api/index.ts runs the same API as a serverless function instead.
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono, type Context } from 'hono'
import { app as api } from './app'
import { closeDb } from './db'

const root = process.env.STATIC_ROOT || './dist'
const port = Number(process.env.PORT) || 3000

const cache = (value: string) => (_path: string, c: Context) => {
  c.header('Cache-Control', value)
}
// index.html must be re-checked on every visit so a new deploy shows up immediately.
const htmlOrShort = (path: string, c: Context) => {
  c.header('Cache-Control', path.endsWith('.html') ? 'no-cache' : 'public, max-age=3600')
}

const site = new Hono()

site.get('/healthz', (c) => c.text('ok'))

// The API keeps its own error handling and /api base path.
site.all('/api/*', (c) => api.fetch(c.req.raw, c.env))

// Built files have a content hash in their name, so they can be cached forever.
site.use('/assets/*', serveStatic({ root, onFound: cache('public, max-age=31536000, immutable') }))
site.use('*', serveStatic({ root, onFound: htmlOrShort }))

// Page addresses (/favorites, /admin…) get the app, which routes in the browser.
// A missing file (anything with an extension) stays a 404 instead of returning the page.
site.get(
  '*',
  async (c, next) => (/\.[\w]+$/.test(c.req.path) ? c.notFound() : next()),
  serveStatic({ root, path: 'index.html', onFound: cache('no-cache') }),
)

const server = serve({ fetch: site.fetch, port }, (info) => {
  console.info(`ZEE Masterpiece listening on port ${info.port}`)
})

// Docker sends SIGTERM on deploys: finish in-flight requests and close the database cleanly.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    setTimeout(() => process.exit(0), 8000).unref()
    server.close(() => {
      closeDb().finally(() => process.exit(0))
    })
  })
}
