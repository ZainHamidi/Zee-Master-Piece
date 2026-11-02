import { env } from './env'

// Sends email through Resend's HTTP API. Without a key (local development) the message is printed
// to the terminal instead, so password resets can still be tested.
export async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!env.resendKey) {
    console.info(`\n[email not sent: RESEND_API_KEY is not set]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.resendFrom, to: [to], subject, html, text }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

export function resetEmail(link: string) {
  const text = `Someone asked to reset the password for your ZEE Masterpiece dashboard.\n\nChoose a new password here (the link works once, for 1 hour):\n${link}\n\nIf this wasn't you, ignore this email; your password stays the same.`
  const html = `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1d2a22">
    <h1 style="font-family:Georgia,serif;font-weight:normal;color:#01301e">Reset your password</h1>
    <p>Someone asked to reset the password for your ZEE Masterpiece dashboard.</p>
    <p style="margin:28px 0">
      <a href="${link}" style="background:#01301e;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">Choose a new password</a>
    </p>
    <p style="color:#7d7568;font-size:14px">The link works once, for 1 hour. If this wasn't you, ignore this email; your password stays the same.</p>
  </div>`
  return { subject: 'Reset your ZEE Masterpiece dashboard password', html, text }
}
