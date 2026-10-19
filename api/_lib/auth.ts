import { SignJWT, jwtVerify } from 'jose'
import type { VercelRequest } from '@vercel/node'

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? '')

export async function signToken(user: string) {
  return new SignJWT({ sub: user, role: 'org' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret())
}

export async function isAuthorized(req: VercelRequest) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token || !process.env.JWT_SECRET) return false
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload.sub === process.env.ADMIN_USER && payload.role === 'org'
  } catch {
    return false
  }
}
