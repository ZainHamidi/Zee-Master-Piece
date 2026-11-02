// Imported first by each script, so .env.local is loaded before server/env.ts reads process.env.
try {
  process.loadEnvFile('.env.local')
} catch {
  // No .env.local: rely on variables already set in the shell.
}
