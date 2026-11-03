import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, QuestionLg, TicketPerforatedFill } from 'react-bootstrap-icons'
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

const SHEETS = Math.max(1, Math.ceil(TICKETS.total / TICKETS.perSheet))

export function Tickets() {
  const { get, taken, loading, markLocal, online } = useTickets()
  const [selected, setSelected] = useState<number | null>(null)
  const [sheet, setSheet] = useState(0)
  const first = sheet * TICKETS.perSheet + 1
  const last = Math.min(first + TICKETS.perSheet - 1, TICKETS.total)
  const numbers = Array.from({ length: last - first + 1 }, (_, i) => first + i)

  return (
    <section id="boletos" className="dots relative overflow-hidden px-4 py-28">
      <img src="/media/alguna_esquina.webp" alt="" className="animate-sway pointer-events-none absolute -left-8 -top-6 w-48 opacity-90 sm:w-64" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange/15 px-4 py-1 text-lg text-rust">
            <TicketPerforatedFill className="size-5" /> Hojas de {TICKETS.perSheet} boletos
          </span>
          <h2 className="mt-4 font-display text-5xl text-bark sm:text-7xl">
            Reserva tu <span className="text-gradient">boleto</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl text-bark/85">
            Cada boleto cuesta <strong className="text-orange">${TICKETS.price} MXN</strong> o llévate{' '}
            <strong className="text-orange">{TICKETS.promo.qty} por ${TICKETS.promo.price} MXN</strong>. {TICKETS.purpose}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-5">
            <motion.div whileHover={{ rotate: -2, scale: 1.04 }} className="card bg-lime p-5 text-center">
              <div className="flex h-[1em] items-center justify-center font-display text-6xl text-bark" aria-label="Boletos disponibles desconocidos">
                <QuestionLg className="size-14 animate-float" />
              </div>
              <div className="text-lg text-bark">disponibles</div>
            </motion.div>
            <motion.div whileHover={{ rotate: 2, scale: 1.04 }} className="card bg-orange p-5 text-center">
              <div className="font-display text-6xl text-cream"><CountUp to={taken} /></div>
              <div className="text-lg text-cream">apartados</div>
            </motion.div>
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSheet((s) => s - 1)}
                disabled={sheet === 0}
                aria-label="Hoja anterior"
                className="grid size-11 place-items-center rounded-full bg-cream text-bark shadow transition hover:bg-lime disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cream"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="text-center">
                <div className="font-display text-3xl text-bark sm:text-4xl">Hoja {sheet + 1} de ?</div>
                <div className="text-base text-bark/75">Boletos {first} al {last}</div>
              </div>
              <button
                type="button"
                onClick={() => setSheet((s) => s + 1)}
                disabled={sheet >= SHEETS - 1}
                aria-label="Hoja siguiente"
                className="grid size-11 place-items-center rounded-full bg-cream text-bark shadow transition hover:bg-lime disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cream"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={sheet}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className={`grid grid-cols-8 gap-1.5 sm:grid-cols-10 sm:gap-2 lg:grid-cols-20 ${loading ? 'animate-pulse' : ''}`}
              >
                {numbers.map((n, i) => {
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
                      transition={{ delay: (i % 20) * 0.02 + Math.floor(i / 20) * 0.03, type: 'spring', stiffness: 260, damping: 18 }}
                      whileTap={s === 'available' ? { scale: 0.85 } : undefined}
                      aria-label={`Boleto ${n}, ${s === 'available' ? 'disponible' : s === 'paid' ? 'pagado' : 'reservado'}`}
                      className={`relative aspect-square rounded-xl text-sm transition-[background-color,box-shadow,transform] duration-200 sm:text-base ${STYLE[s]}`}
                    >
                      {n}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

      {selected !== null && (
        <ReserveModal number={selected} onClose={() => setSelected(null)} onReserved={(n) => markLocal(n, 'reserved')} online={online} />
      )}
    </section>
  )
}
