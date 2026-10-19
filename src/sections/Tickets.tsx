import { motion } from 'motion/react'
import { useState } from 'react'
import { TicketPerforatedFill } from 'react-bootstrap-icons'
import { TICKETS } from '../config'
import { useTickets } from '../lib/useTickets'
import { Reveal } from '../components/ui/Reveal'
import { CountUp } from '../components/ui/CountUp'
import { ReserveModal } from './ReserveModal'

const STYLE = {
  available: 'bg-cream text-bark hover:bg-lime hover:shadow-[0_8px_20px_-6px_rgba(184,193,31,.9)] hover:-translate-y-1 hover:scale-110 hover:z-10',
  reserved: 'bg-sand/50 text-bark/35 line-through cursor-not-allowed',
  paid: 'bg-bark text-sand/70 cursor-not-allowed',
}

export function Tickets() {
  const { get, taken, available, loading, markLocal, online } = useTickets()
  const [selected, setSelected] = useState<number | null>(null)
  const pct = Math.round((taken / TICKETS.total) * 100)

  return (
    <section id="boletos" className="dots relative overflow-hidden px-4 py-28">
      <img src="/media/alguna_esquina.webp" alt="" className="animate-sway pointer-events-none absolute -left-8 -top-6 w-48 opacity-90 sm:w-64" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange/15 px-4 py-1 text-lg text-rust">
            <TicketPerforatedFill className="size-5" /> 200 boletos
          </span>
          <h2 className="mt-4 font-display text-5xl text-bark sm:text-7xl">
            Reserva tu <span className="text-gradient">boleto</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl text-bark/85">
            Cada boleto cuesta <strong className="text-orange">${TICKETS.price} MXN</strong>. {TICKETS.purpose}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-5">
            <motion.div whileHover={{ rotate: -2, scale: 1.04 }} className="card bg-lime p-5 text-center">
              <div className="font-display text-6xl text-bark"><CountUp to={available} /></div>
              <div className="text-lg text-bark">disponibles</div>
            </motion.div>
            <motion.div whileHover={{ rotate: 2, scale: 1.04 }} className="card bg-orange p-5 text-center">
              <div className="font-display text-6xl text-cream"><CountUp to={taken} /></div>
              <div className="text-lg text-cream">apartados</div>
            </motion.div>
          </div>
          <div className="mx-auto mt-6 h-4 max-w-xl overflow-hidden rounded-full bg-sand/40">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(pct, 2)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-lime via-sun to-orange"
            />
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-base">
          <span className="flex items-center gap-2"><i className="inline-block size-4 rounded-md border-2 border-bark/30 bg-cream" />Disponible</span>
          <span className="flex items-center gap-2"><i className="inline-block size-4 rounded-md bg-sand/50" />Reservado</span>
          <span className="flex items-center gap-2"><i className="inline-block size-4 rounded-md bg-bark" />Pagado</span>
        </div>

        {!online && (
          <p className="mx-auto mt-6 max-w-md rounded-2xl bg-sun p-3 text-center">
            Modo demo: configura Supabase en .env para guardar reservas reales.
          </p>
        )}

        <Reveal delay={0.15}>
          <div className="card mt-10 bg-gradient-to-br from-sun/70 to-sand/60 p-3 backdrop-blur sm:p-6">
            <div className={`grid grid-cols-8 gap-1.5 sm:grid-cols-10 sm:gap-2 lg:grid-cols-20 ${loading ? 'animate-pulse' : ''}`}>
              {Array.from({ length: TICKETS.total }, (_, i) => i + 1).map((n) => {
                const s = get(n)
                return (
                  <motion.button
                    key={n}
                    type="button"
                    disabled={s !== 'available' || loading}
                    onClick={() => setSelected(n)}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (n % 20) * 0.02 + Math.floor((n - 1) / 20) * 0.03, type: 'spring', stiffness: 260, damping: 18 }}
                    whileTap={s === 'available' ? { scale: 0.85 } : undefined}
                    aria-label={`Boleto ${n}, ${s === 'available' ? 'disponible' : s === 'paid' ? 'pagado' : 'reservado'}`}
                    className={`relative aspect-square rounded-xl text-sm transition-[background-color,box-shadow,transform] duration-200 sm:text-base ${STYLE[s]}`}
                  >
                    {n}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>

      {selected !== null && (
        <ReserveModal number={selected} onClose={() => setSelected(null)} onReserved={(n) => markLocal(n, 'reserved')} online={online} />
      )}
    </section>
  )
}
