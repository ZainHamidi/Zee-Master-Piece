import { randomBytes, scrypt, timingSafeEqual, createHash, type BinaryLike } from 'node:crypto'

// scrypt from Node's standard library: a slow, salted hash, so stolen hashes are expensive to crack.
const KEY_LENGTH = 64
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

const derive = (password: string, salt: BinaryLike) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, PARAMS, (error, key) => (error ? reject(error) : resolve(key))),
  )

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt)
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const actual = await derive(password, Buffer.from(salt, 'base64'))
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

// A hash of a real password, compared against when an email isn't found, so a wrong email takes as
// long as a wrong password and response times don't reveal which accounts exist.
export const decoyHash = hashPassword(randomBytes(16).toString('hex'))

export const newToken = () => randomBytes(32).toString('base64url')
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export const MIN_PASSWORD_LENGTH = 8
