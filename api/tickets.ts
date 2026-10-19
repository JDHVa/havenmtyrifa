import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthorized } from './_lib/auth.js'
import { db } from './_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await isAuthorized(req))) return res.status(401).json({ error: 'No autorizado' })
  const client = db()

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('ticket_holders')
      .select('number, code, name, origin, sale_point, payment_method, reserved_at, paid_at, ticket_status(status)')
      .order('number')
    if (error) return res.status(500).json({ error: error.message })
    const rows = (data ?? []).map((r) => {
      const { ticket_status, ...rest } = r as typeof r & { ticket_status: { status: string } | null }
      return { ...rest, status: ticket_status?.status ?? 'reserved' }
    })
    return res.status(200).json({ rows })
  }

  if (req.method === 'POST') {
    const { number, action } = (req.body ?? {}) as { number?: number; action?: string }
    const n = Number(number)
    if (!Number.isInteger(n) || n < 1 || n > 200) return res.status(400).json({ error: 'Número inválido' })

    if (action === 'paid' || action === 'unpaid') {
      const paid = action === 'paid'
      const a = await client.from('ticket_status').update({ status: paid ? 'paid' : 'reserved' }).eq('number', n)
      const b = await client.from('ticket_holders').update({ paid_at: paid ? new Date().toISOString() : null }).eq('number', n)
      if (a.error || b.error) return res.status(500).json({ error: (a.error ?? b.error)!.message })
      return res.status(200).json({ ok: true })
    }

    if (action === 'release') {
      const a = await client.from('ticket_holders').delete().eq('number', n)
      const b = await client.from('ticket_status').update({ status: 'available' }).eq('number', n)
      if (a.error || b.error) return res.status(500).json({ error: (a.error ?? b.error)!.message })
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Acción inválida' })
  }

  return res.status(405).end()
}
