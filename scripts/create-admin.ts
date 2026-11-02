// npm run admin:create [email]
// Adds a dashboard admin, or resets the password of an existing one (no email needed).
import './load-env'
import { closeDb } from '../server/db'
import { configured } from '../server/env'
import { createOrResetAdmin } from './admin'

if (!configured()) {
  console.error('MONGODB_URI is not set. Add it to .env.local first (see MONGODB_SETUP.md).')
  process.exit(1)
}
try {
  await createOrResetAdmin(process.argv[2]?.toLowerCase())
} finally {
  await closeDb()
}
