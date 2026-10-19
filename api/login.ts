import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'
import { signToken } from './_lib/auth.js'

const same = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { user, password } = (req.body ?? {}) as { user?: string; password?: string }
  const okUser = same(String(user ?? '').trim().toLowerCase(), (process.env.ADMIN_USER ?? '').trim().toLowerCase())
  const okPass = same(String(password ?? '').trim(), (process.env.ADMIN_PASSWORD ?? '').trim())
  if (!okUser || !okPass || !process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }
  return res.status(200).json({ token: await signToken(process.env.ADMIN_USER!.trim()) })
}
