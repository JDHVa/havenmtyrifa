import { useState } from 'react'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'
import { supabase, type TicketStatus } from '../lib/supabase'
import { Reveal } from '../components/ui/Reveal'

const LABEL: Record<TicketStatus, { text: string; cls: string }> = {
  available: { text: 'Disponible: nadie lo ha apartado.', cls: 'bg-cream' },
  reserved: { text: 'Reservado: pendiente de pago.', cls: 'bg-sun' },
  paid: { text: '¡Pagado! Boleto confirmado. 🎉', cls: 'bg-lime' },
}

export function Verify() {
  const [q, setQ] = useState('')
  const [res, setRes] = useState<{ number: number; status: TicketStatus } | null | 'none'>(null)
  const [busy, setBusy] = useState(false)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!q.trim() || !supabase) return setRes('none')
    setBusy(true)
    const { data } = await supabase.rpc('check_ticket', { p_query: q.trim() })
    const row = (data as { number: number; status: TicketStatus }[] | null)?.[0]
    setRes(row ?? 'none')
    setBusy(false)
  }

  return (
    <section id="verificar" className="relative overflow-hidden bg-gradient-to-br from-sand via-sun/70 to-orange/60 px-4 py-28">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <h2 className="font-display text-5xl text-bark sm:text-7xl">Verifica tu boleto</h2>
          <p className="mt-4 text-xl text-bark/80">Escribe tu número de boleto o tu folio (HVN-000-XXXX).</p>
        </Reveal>
        <Reveal delay={0.1}>
          <form onSubmit={check} className="card mt-10 flex flex-col gap-3 bg-cream/80 p-3 backdrop-blur sm:flex-row sm:rounded-full">
            <label className="flex flex-1 items-center gap-3 px-4">
              <Search className="size-5 text-rust" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="27 o HVN-027-AB12"
                aria-label="Número o folio"
                className="w-full bg-transparent py-3 text-xl text-bark outline-none placeholder:text-bark/40"
              />
            </label>
            <button type="submit" disabled={busy} className="btn bg-bark text-sun">
              {busy ? 'Buscando…' : 'Verificar'}
            </button>
          </form>
        </Reveal>
        {res && (
          <motion.div
            key={JSON.stringify(res)}
            initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className={`card mt-8 p-6 text-center text-2xl ${res === 'none' ? 'bg-cream' : LABEL[res.status].cls}`}
          >
            {res === 'none' ? 'No encontramos ese boleto.' : `Boleto #${res.number} · ${LABEL[res.status].text}`}
          </motion.div>
        )}
      </div>
    </section>
  )
}
