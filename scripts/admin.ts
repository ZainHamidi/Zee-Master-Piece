import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { collections } from '../server/db'
import { hashPassword, MIN_PASSWORD_LENGTH } from '../server/passwords'
import { ask, askHidden } from './prompt'

// Creates an admin, or sets a new password if the email already has an account.
export async function createOrResetAdmin(presetEmail?: string) {
  let email = presetEmail ?? ''
  while (!z.email().safeParse(email).success) {
    email = (await ask('Admin email: ')).toLowerCase()
  }

  let password = ''
  for (;;) {
    password = await askHidden(`Password (at least ${MIN_PASSWORD_LENGTH} characters): `)
    if (password.length < MIN_PASSWORD_LENGTH) {
      console.log(`  Too short; use at least ${MIN_PASSWORD_LENGTH} characters.`)
      continue
    }
    if ((await askHidden('Type it again: ')) === password) break
    console.log('  The two passwords didn’t match; try again.')
  }

  const { admins, sessions } = await collections()
  const existing = await admins.findOne({ email })
  const password_hash = await hashPassword(password)
  if (existing) {
    await admins.updateOne({ _id: existing._id }, { $set: { password_hash } })
    await sessions.deleteMany({ admin_id: existing._id })
    console.log(`✓ New password set for ${email} (signed out everywhere).`)
  } else {
    await admins.insertOne({ _id: randomUUID(), email, password_hash, created_at: new Date() })
    console.log(`✓ Admin ${email} created. Sign in at /admin.`)
  }
}
