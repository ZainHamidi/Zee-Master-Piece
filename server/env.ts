// Server settings, from environment variables (.env.local locally, Project Settings → Environment
// Variables on Vercel). See MONGODB_SETUP.md.
export const env = {
  mongoUri: process.env.MONGODB_URI ?? '',
  dbName: process.env.MONGODB_DB || 'zee-masterpiece',
  // Public address of the site, used in password-reset emails. Falls back to the request's own origin.
  siteUrl: (process.env.SITE_URL ?? '').replace(/\/$/, ''),
  resendKey: process.env.RESEND_API_KEY ?? '',
  // Until you verify a domain in Resend, keep onboarding@resend.dev; it can only email your Resend account address.
  resendFrom: process.env.RESEND_FROM || 'ZEE Masterpiece <onboarding@resend.dev>',
  production: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
}

export const configured = () => Boolean(env.mongoUri)
