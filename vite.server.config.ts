import { defineConfig } from 'vite'

// `npm run build:server`: bundles the Node server and the database scripts into dist-server/ for
// the Docker image (see Dockerfile). Packages stay in node_modules; only the project's code is bundled.
export default defineConfig({
  publicDir: false,
  build: {
    ssr: true,
    outDir: 'dist-server',
    emptyOutDir: true,
    target: 'node22',
    rolldownOptions: {
      input: {
        index: 'server/index.ts',
        'setup-db': 'scripts/setup-db.ts',
        'create-admin': 'scripts/create-admin.ts',
      },
    },
  },
})
