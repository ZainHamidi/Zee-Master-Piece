import { Hono, type Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { Binary } from 'mongodb'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { contentKeys } from '../src/store/types'
import { collections, type AdminDoc, type ProductDoc, type SettingsDoc } from './db'
import { resetEmail, sendEmail } from './email'
import { configured, env } from './env'
import { decoyHash, hashPassword, hashToken, MIN_PASSWORD_LENGTH, newToken, verifyPassword } from './passwords'

type Env = { Variables: { admin: AdminDoc } }

const SESSION_COOKIE = 'zee_admin'
const SESSION_DAYS = 30
const RESET_MINUTES = 60
const MAX_ATTEMPTS = 8 // per email + IP, per 15 minutes
const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // Vercel caps request bodies at 4.5 MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const app = new Hono<Env>().basePath('/api')

// ─── Plumbing ──────────────────────────────────────────────────────────────

const fail = (c: Context, status: 400 | 401 | 403 | 404 | 413 | 415 | 429 | 500 | 503, error: string) =>
  c.json({ error }, status)

app.onError((error, c) => {
  console.error(error)
  return fail(c, 500, 'Something went wrong on the server. Please try again.')
})

app.use('*', async (c, next) => {
  if (!configured()) return fail(c, 503, 'not_configured')
  await next()
})

// Changes must come from this site's own pages (on top of the SameSite cookie).
app.use('*', async (c, next) => {
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    const origin = c.req.header('origin')
    const host = c.req.header('x-forwarded-host') ?? c.req.header('host')
    if (origin && new URL(origin).host !== host) return fail(c, 403, 'Cross-site request blocked')
  }
  await next()
})

const clientIp = (c: Context) => c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'local'

async function tooManyAttempts(key: string) {
  const { attempts } = await collections()
  const since = new Date(Date.now() - 15 * 60 * 1000)
  return (await attempts.countDocuments({ key, at: { $gte: since } })) >= MAX_ATTEMPTS
}

async function recordAttempt(key: string) {
  const { attempts } = await collections()
  await attempts.insertOne({ key, at: new Date() })
}

async function startSession(c: Context, adminId: string) {
  const { sessions } = await collections()
  const token = newToken()
  await sessions.insertOne({
    _id: hashToken(token),
    admin_id: adminId,
    expires_at: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  })
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.production || new URL(c.req.url).protocol === 'https:',
    sameSite: 'Strict',
    path: '/api',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

async function currentAdmin(c: Context): Promise<AdminDoc | null> {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return null
  const { sessions, admins } = await collections()
  const session = await sessions.findOne({ _id: hashToken(token), expires_at: { $gt: new Date() } })
  return session ? admins.findOne({ _id: session.admin_id }) : null
}

const requireAdmin = async (c: Context<Env>, next: () => Promise<void>) => {
  const admin = await currentAdmin(c)
  if (!admin) return fail(c, 401, 'Please sign in again.')
  c.set('admin', admin)
  await next()
}

// Parses a JSON body against a schema, or answers 400 with the first problem.
async function body<T extends z.ZodType>(c: Context, schema: T): Promise<z.infer<T> | Response> {
  const parsed = schema.safeParse(await c.req.json().catch(() => undefined))
  if (parsed.success) return parsed.data
  const issue = parsed.error.issues[0]
  return fail(c, 400, `${issue.path.join('.') || 'Request'}: ${issue.message}`)
}

const toProductRow = ({ _id, created_at: _created, ...rest }: ProductDoc) => ({ id: _id, ...rest })
const toSettingsRow = (doc: SettingsDoc | null) => {
  if (!doc) return null
  const { _id: _ignored, ...rest } = doc
  return rest
}

// ─── Public ────────────────────────────────────────────────────────────────

app.get('/store', async (c) => {
  const { products, settings } = await collections()
  const [rows, site] = await Promise.all([
    products.find({ visible: true }).sort({ sort_order: 1, created_at: 1 }).toArray(),
    settings.findOne({ _id: 'site' }),
  ])
  // Short CDN cache: quick for shoppers, and dashboard edits show within seconds.
  c.header('Cache-Control', 'public, max-age=0, s-maxage=5, stale-while-revalidate=60')
  return c.json({ products: rows.map(toProductRow), settings: toSettingsRow(site) })
})

app.get('/images/:file', async (c) => {
  const { images } = await collections()
  const image = await images.findOne({ _id: c.req.param('file').replace(/\.\w+$/, '') })
  if (!image) return fail(c, 404, 'Image not found')
  // Each upload gets a new address, so it can be cached forever.
  return c.body(new Uint8Array(image.data.buffer), 200, {
    'Content-Type': image.content_type,
    'Cache-Control': 'public, max-age=31536000, immutable',
  })
})

// ─── Sign-in ───────────────────────────────────────────────────────────────

const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'))
const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`).max(200)

app.post('/auth/login', async (c) => {
  const input = await body(c, z.object({ email: emailSchema, password: z.string().min(1).max(200) }))
  if (input instanceof Response) return input
  const key = `login|${clientIp(c)}|${input.email}`
  if (await tooManyAttempts(key)) return fail(c, 429, 'Too many attempts. Please wait a few minutes and try again.')

  const { admins, attempts } = await collections()
  const admin = await admins.findOne({ email: input.email })
  const ok = await verifyPassword(input.password, admin?.password_hash ?? (await decoyHash))
  if (!admin || !ok) {
    await recordAttempt(key)
    return fail(c, 401, 'Invalid login credentials')
  }
  await attempts.deleteMany({ key })
  await startSession(c, admin._id)
  return c.json({ email: admin.email })
})

app.post('/auth/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) await (await collections()).sessions.deleteOne({ _id: hashToken(token) })
  deleteCookie(c, SESSION_COOKIE, { path: '/api' })
  return c.json({ ok: true })
})

app.get('/auth/me', async (c) => {
  c.header('Cache-Control', 'no-store')
  const admin = await currentAdmin(c)
  return admin ? c.json({ email: admin.email }) : fail(c, 401, 'Not signed in')
})

// Always answers the same way, so it can't be used to find out which emails have accounts.
app.post('/auth/forgot', async (c) => {
  const input = await body(c, z.object({ email: emailSchema }))
  if (input instanceof Response) return input
  const key = `forgot|${clientIp(c)}|${input.email}`
  if (await tooManyAttempts(key)) return fail(c, 429, 'Too many attempts. Please wait a few minutes and try again.')
  await recordAttempt(key)

  const { admins, resets } = await collections()
  const admin = await admins.findOne({ email: input.email })
  if (admin) {
    const token = newToken()
    await resets.insertOne({
      _id: hashToken(token),
      admin_id: admin._id,
      expires_at: new Date(Date.now() + RESET_MINUTES * 60 * 1000),
    })
    const origin = env.siteUrl || new URL(c.req.url).origin
    const link = `${origin}/admin/reset-password?token=${token}`
    const message = resetEmail(link)
    try {
      await sendEmail(admin.email, message.subject, message.html, message.text)
    } catch (error) {
      console.error('Could not send the password reset email', error)
    }
  }
  return c.json({ ok: true })
})

app.post('/auth/reset', async (c) => {
  const input = await body(c, z.object({ token: z.string().min(20).max(200), password: passwordSchema }))
  if (input instanceof Response) return input
  const { resets, admins, sessions } = await collections()
  const reset = await resets.findOneAndDelete({ _id: hashToken(input.token), expires_at: { $gt: new Date() } })
  if (!reset) return fail(c, 400, 'This reset link has expired or was already used. Ask for a new one.')

  await admins.updateOne({ _id: reset.admin_id }, { $set: { password_hash: await hashPassword(input.password) } })
  // A new password signs out every other device and cancels any other reset links.
  await Promise.all([sessions.deleteMany({ admin_id: reset.admin_id }), resets.deleteMany({ admin_id: reset.admin_id })])
  await startSession(c, reset.admin_id)
  const admin = await admins.findOne({ _id: reset.admin_id })
  return c.json({ email: admin?.email })
})

// ─── Dashboard (signed-in admins only) ─────────────────────────────────────

app.use('/admin/*', requireAdmin)
app.use('/admin/*', async (c, next) => {
  await next()
  c.header('Cache-Control', 'no-store')
})

// Photos are uploaded to /api/images; the built-in ones live under /images.
const imagePath = z
  .string()
  .regex(/^\/(api\/)?images\/[\w.-]+$/, 'must be an uploaded photo')
  .nullable()

const productFields = z.object({
  name_en: z.string().trim().min(1, 'English name is required').max(80),
  name_ar: z.string().trim().max(80),
  description_en: z.string().trim().max(300),
  description_ar: z.string().trim().max(300),
  price: z.coerce.number().min(0).max(1_000_000),
  image_url: imagePath,
  visible: z.boolean(),
  sort_order: z.number().int().min(0),
})

app.get('/admin/products', async (c) => {
  const { products } = await collections()
  const rows = await products.find().sort({ sort_order: 1, created_at: 1 }).toArray()
  return c.json(rows.map(toProductRow))
})

app.post('/admin/products', async (c) => {
  const input = await body(
    c,
    productFields.partial({ name_ar: true, description_en: true, description_ar: true, image_url: true, visible: true, sort_order: true }),
  )
  if (input instanceof Response) return input
  const { products } = await collections()
  const doc: ProductDoc = {
    _id: randomUUID(),
    name_ar: '',
    description_en: '',
    description_ar: '',
    image_url: null,
    visible: true,
    sort_order: (await products.countDocuments()) + 1,
    ...input,
    created_at: new Date(),
  }
  await products.insertOne(doc)
  return c.json(toProductRow(doc), 201)
})

app.patch('/admin/products/:id', async (c) => {
  const input = await body(c, productFields.partial())
  if (input instanceof Response) return input
  const { products } = await collections()
  const doc = await products.findOneAndUpdate({ _id: c.req.param('id') }, { $set: input }, { returnDocument: 'after' })
  return doc ? c.json(toProductRow(doc)) : fail(c, 404, 'Product not found')
})

app.delete('/admin/products/:id', async (c) => {
  const { products } = await collections()
  const doc = await products.findOneAndDelete({ _id: c.req.param('id') })
  if (!doc) return fail(c, 404, 'Product not found')
  await deleteImage(doc.image_url)
  return c.json({ ok: true })
})

app.put('/admin/products/order', async (c) => {
  const input = await body(c, z.object({ ids: z.array(z.string()).max(1000) }))
  if (input instanceof Response) return input
  const { products } = await collections()
  if (input.ids.length) {
    await products.bulkWrite(
      input.ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { sort_order: index + 1 } } } })),
    )
  }
  return c.json({ ok: true })
})

const urlOrEmpty = z
  .string()
  .trim()
  .max(300)
  .refine((value) => !value || /^https?:\/\//i.test(value), 'must start with https://')

const settingsPatch = z
  .object({
    whatsapp_number: z.string().regex(/^\d{8,15}$/, 'use 8–15 digits including the country code'),
    facebook_url: urlOrEmpty,
    instagram_url: urlOrEmpty,
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .refine((code) => Intl.supportedValuesOf('currency').includes(code), 'unknown currency'),
    hero_image_url: imagePath,
    custom_image_url: imagePath,
    content: z.object({
      en: z.partialRecord(z.enum(contentKeys), z.string().max(600)),
      ar: z.partialRecord(z.enum(contentKeys), z.string().max(600)),
    }),
  })
  .partial()

const defaultSettings: Omit<SettingsDoc, '_id'> = {
  whatsapp_number: '',
  facebook_url: '',
  instagram_url: '',
  currency: 'USD',
  hero_image_url: null,
  custom_image_url: null,
  content: { en: {}, ar: {} },
}

app.get('/admin/settings', async (c) => {
  const { settings } = await collections()
  return c.json(toSettingsRow(await settings.findOne({ _id: 'site' })))
})

app.patch('/admin/settings', async (c) => {
  const input = await body(c, settingsPatch)
  if (input instanceof Response) return input
  const { settings } = await collections()
  const fresh = Object.fromEntries(Object.entries(defaultSettings).filter(([key]) => !(key in input)))
  const doc = await settings.findOneAndUpdate(
    { _id: 'site' },
    { $set: input as Partial<SettingsDoc>, $setOnInsert: fresh },
    { upsert: true, returnDocument: 'after' },
  )
  return c.json(toSettingsRow(doc))
})

app.post('/admin/images', async (c) => {
  const type = c.req.header('content-type')?.split(';')[0] ?? ''
  if (!IMAGE_TYPES.includes(type)) return fail(c, 415, 'Upload a JPG, PNG or WebP image')
  const data = Buffer.from(await c.req.arrayBuffer())
  if (!data.length) return fail(c, 400, 'The image is empty')
  if (data.length > MAX_IMAGE_BYTES) return fail(c, 413, 'That image is too large (4 MB maximum)')
  const { images } = await collections()
  const id = randomUUID()
  await images.insertOne({ _id: id, content_type: type, data: new Binary(data), size: data.length, created_at: new Date() })
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'
  return c.json({ url: `/api/images/${id}.${ext}` }, 201)
})

app.delete('/admin/images/:file', async (c) => {
  await deleteImage(`/api/images/${c.req.param('file')}`)
  return c.json({ ok: true })
})

// Removes an uploaded photo. Built-in photos (under /images/) aren't in the database and are left alone.
async function deleteImage(url: string | null | undefined) {
  const match = url?.match(/^\/api\/images\/([\w-]+)/)
  if (match) await (await collections()).images.deleteOne({ _id: match[1] })
}
