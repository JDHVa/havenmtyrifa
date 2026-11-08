import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'node:crypto'
import { isAuthorized } from './_lib/auth.js'
import { db } from './_lib/db.js'

const validNumber = (v: unknown) => {
  const n = Number(v)
  return Number.isInteger(n) && n >= 1 && n <= 200 ? n : null
}

const missingGroups = (e: { message?: string; code?: string } | null) =>
  !!e && (e.code === '42703' || /group_code/.test(e.message ?? ''))

const NEEDS_MIGRATION = 'Para usar paquetes, corre supabase/migrations/002_multi_tickets.sql en Supabase.'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await isAuthorized(req))) return res.status(401).json({ error: 'No autorizado' })
  const client = db()

  if (req.method === 'GET') {
    const base = 'number, code, name, origin, sale_point, payment_method, reserved_at, paid_at, ticket_status(status)'
    let groups = true
    let result = await client.from('ticket_holders').select(`group_code, ${base}`).order('number')
    if (missingGroups(result.error)) {
      groups = false
      result = (await client.from('ticket_holders').select(base).order('number')) as typeof result
    }
    if (result.error) return res.status(500).json({ error: result.error.message })
    const rows = (result.data ?? []).map((r) => {
      const { ticket_status, ...rest } = r as typeof r & { ticket_status: { status: string } | null }
      return { ...rest, group_code: (rest as { group_code?: string | null }).group_code ?? null, status: ticket_status?.status ?? 'reserved' }
    })
    return res.status(200).json({ rows, groups })
  }

  if (req.method !== 'POST') return res.status(405).end()

  const { number, numbers, action } = (req.body ?? {}) as { number?: number; numbers?: number[]; action?: string }

  if (action === 'group') {
    const list = [...new Set((numbers ?? []).map(validNumber))]
    if (list.length !== 2 || list.some((n) => n === null)) return res.status(400).json({ error: 'Elige exactamente 2 boletos' })
    const { data, error } = await client.from('ticket_holders').select('number, group_code').in('number', list as number[])
    if (missingGroups(error)) return res.status(400).json({ error: NEEDS_MIGRATION })
    if (error) return res.status(500).json({ error: error.message })
    if ((data ?? []).length !== 2) return res.status(400).json({ error: 'Ambos boletos deben estar apartados' })
    const previous = [...new Set((data ?? []).map((r) => r.group_code as string | null).filter((g): g is string => !!g))]
    const group = `PAQ-${randomBytes(2).toString('hex').toUpperCase()}`
    const up = await client.from('ticket_holders').update({ group_code: group }).in('number', list as number[])
    if (up.error) return res.status(500).json({ error: up.error.message })
    for (const g of previous) {
      const left = await client.from('ticket_holders').select('number').eq('group_code', g)
      if ((left.data ?? []).length < 2) await client.from('ticket_holders').update({ group_code: null }).eq('group_code', g)
    }
    return res.status(200).json({ ok: true, group_code: group })
  }

  const n = validNumber(number)
  if (n === null) return res.status(400).json({ error: 'Número inválido' })

  const holder = await client.from('ticket_holders').select('group_code').eq('number', n).maybeSingle()
  const groups = !missingGroups(holder.error)
  if (holder.error && groups) return res.status(500).json({ error: holder.error.message })
  const group = groups ? ((holder.data?.group_code as string | null) ?? null) : null

  const members = async () => {
    if (!group) return [n]
    const { data } = await client.from('ticket_holders').select('number').eq('group_code', group)
    return (data ?? []).map((r) => r.number as number)
  }

  if (action === 'paid' || action === 'unpaid') {
    const paid = action === 'paid'
    const list = await members()
    const a = await client.from('ticket_status').update({ status: paid ? 'paid' : 'reserved' }).in('number', list)
    const b = await client.from('ticket_holders').update({ paid_at: paid ? new Date().toISOString() : null }).in('number', list)
    if (a.error || b.error) return res.status(500).json({ error: (a.error ?? b.error)!.message })
    return res.status(200).json({ ok: true })
  }

  if (action === 'ungroup') {
    if (!groups) return res.status(400).json({ error: NEEDS_MIGRATION })
    if (!group) return res.status(200).json({ ok: true })
    const up = await client.from('ticket_holders').update({ group_code: null }).eq('group_code', group)
    if (up.error) return res.status(500).json({ error: up.error.message })
    return res.status(200).json({ ok: true })
  }

  if (action === 'release') {
    const a = await client.from('ticket_holders').delete().eq('number', n)
    const b = await client.from('ticket_status').update({ status: 'available' }).eq('number', n)
    if (a.error || b.error) return res.status(500).json({ error: (a.error ?? b.error)!.message })
    if (group) {
      const rest = await members()
      if (rest.length < 2) await client.from('ticket_holders').update({ group_code: null }).eq('group_code', group)
    }
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Acción inválida' })
}
