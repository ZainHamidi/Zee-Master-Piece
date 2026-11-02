import { MongoClient, type Binary, type Collection, type Db } from 'mongodb'
import { env } from './env'

export type ProductDoc = {
  _id: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  price: number
  image_url: string | null
  visible: boolean
  sort_order: number
  created_at: Date
}

export type ContentDoc = { en: Record<string, string>; ar: Record<string, string> }

export type SettingsDoc = {
  _id: 'site'
  whatsapp_number: string
  facebook_url: string
  instagram_url: string
  currency: string
  hero_image_url: string | null
  custom_image_url: string | null
  content: ContentDoc
}

export type ImageDoc = { _id: string; content_type: string; data: Binary; size: number; created_at: Date }
export type AdminDoc = { _id: string; email: string; password_hash: string; created_at: Date }
// Only a hash of each token is stored, so a database leak doesn't hand out live sessions or reset links.
export type SessionDoc = { _id: string; admin_id: string; expires_at: Date }
export type ResetDoc = { _id: string; admin_id: string; expires_at: Date }
export type AttemptDoc = { key: string; at: Date }

// One connection per server instance, reused across requests (and across Vercel invocations while warm).
let clientPromise: Promise<MongoClient> | undefined

async function database(): Promise<Db> {
  clientPromise ??= new MongoClient(env.mongoUri, { maxPoolSize: 5 }).connect().catch((error) => {
    clientPromise = undefined
    throw error
  })
  return (await clientPromise).db(env.dbName)
}

export async function collections() {
  const db = await database()
  return {
    products: db.collection<ProductDoc>('products'),
    settings: db.collection<SettingsDoc>('settings'),
    images: db.collection<ImageDoc>('images'),
    admins: db.collection<AdminDoc>('admins'),
    sessions: db.collection<SessionDoc>('sessions'),
    resets: db.collection<ResetDoc>('password_resets'),
    attempts: db.collection<AttemptDoc>('login_attempts'),
  }
}

export type Collections = Awaited<ReturnType<typeof collections>>
export type { Collection }

// Indexes, including TTL indexes that make MongoDB delete expired sessions, reset links and
// login attempts by itself. Safe to run repeatedly.
export async function ensureIndexes() {
  const c = await collections()
  await Promise.all([
    c.products.createIndex({ sort_order: 1, created_at: 1 }),
    c.admins.createIndex({ email: 1 }, { unique: true }),
    c.sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
    c.resets.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
    c.attempts.createIndex({ at: 1 }, { expireAfterSeconds: 15 * 60 }),
    c.attempts.createIndex({ key: 1 }),
  ])
}

export async function closeDb() {
  if (clientPromise) await (await clientPromise).close()
  clientPromise = undefined
}
