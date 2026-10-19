import { useEffect, useState } from 'react'
import { supabase, type TicketStatus } from './supabase'
import { TICKETS } from '../config'

export function useTickets() {
  const [status, setStatus] = useState<Record<number, TicketStatus>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const client = supabase
    let alive = true
    client
      .from('ticket_status')
      .select('number, status')
      .order('number')
      .then(({ data }) => {
        if (!alive) return
        const next: Record<number, TicketStatus> = {}
        for (const r of data ?? []) next[r.number] = r.status
        setStatus(next)
        setLoading(false)
      })
    const channel = client
      .channel('ticket_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_status' }, (payload) => {
        const row = payload.new as { number?: number; status?: TicketStatus }
        if (row.number) setStatus((s) => ({ ...s, [row.number!]: row.status ?? 'available' }))
      })
      .subscribe()
    return () => {
      alive = false
      client.removeChannel(channel)
    }
  }, [])

  const get = (n: number): TicketStatus => status[n] ?? 'available'
  const taken = Object.values(status).filter((s) => s !== 'available').length
  const markLocal = (n: number, s: TicketStatus) => setStatus((prev) => ({ ...prev, [n]: s }))

  return { get, taken, available: TICKETS.total - taken, loading, markLocal, online: !!supabase }
}
