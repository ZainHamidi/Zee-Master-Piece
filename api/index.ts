import { handle } from 'hono/vercel'
import { app } from '../server/app'

// Vercel runs this file as a serverless function for every /api/* request (see vercel.json).
const handler = handle(app)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
