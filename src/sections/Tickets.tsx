import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CheckLg, ChevronLeft, ChevronRight, QuestionLg, TicketPerforatedFill, XLg } from 'react-bootstrap-icons'
import { TICKETS } from '../config'
import { useTickets } from '../lib/useTickets'
import { Reveal } from '../components/ui/Reveal'
import { CountUp } from '../components/ui/CountUp'
import { ReserveModal } from './ReserveModal'
import { orderTotal } from '../lib/pricing'

const SELECTED = 'bg-orange text-cream shadow-[0_8px_20px_-6px_rgba(252,134,22,.9)] -translate-y-1 scale-110 z-10'

const STYLE = {
  available: 'bg-cream text-bark hover:bg-lime hover:shadow-[0_8px_20px_-6px_rgba(184,193,31,.9)] hover:-translate-y-1 hover:scale-110 hover:z-10',
  reserved: 'bg-sand/50 text-bark/35 line-through cursor-not-allowed',
  paid: 'bg-bark text-sand/70 cursor-not-allowed',
}

const SHEETS = Math.max(1, Math.ceil(TICKETS.total / TICKETS.perSheet))

export function Tickets() {
  const { get, taken, loading, markLocal, online } = useTickets()
  const [picked, setPicked] = useState<number[]>([])
  const [order, setOrder] = useState<number[] | null>(null)
  const [limitHit, setLimitHit] = useState(false)
  const [sheet, setSheet] = useState(0)
  const first = sheet * TICKETS.perSheet + 1
  const last = Math.min(first + TICKETS.perSheet - 1, TICKETS.total)
  const numbers = Array.from({ length: last - first + 1 }, (_, i) => first + i)
  const stillFree = picked.filter((n) => get(n) === 'available')

  useEffect(() => {
    if (!order && stillFree.length !== picked.length) setPicked(stillFree)
  }, [order, stillFree, picked.length])

  useEffect(() => {
    if (!limitHit) return
    const t = setTimeout(() => setLimitHit(false), 2500)
    return () => clearTimeout(t)
  }, [limitHit])

  const toggle = (n: number) => {
    setPicked((cur) => {
      if (cur.includes(n)) return cur.filter((x) => x !== n)
      if (cur.length >= TICKETS.maxPerOrder) {
        setLimitHit(true)
        return cur
      }
      return [...cur, n].sort((a, b) => a - b)
    })
  }

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
          <p className="mx-auto mt-2 max-w-2xl text-lg text-bark/75">
            Toca hasta {TICKETS.maxPerOrder} números para apartarlos juntos.
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
                  const on = picked.includes(n) && s === 'available'
                  return (
                    <motion.button
                      key={n}
                      type="button"
                      disabled={s !== 'available' || loading}
                      onClick={() => toggle(n)}
                      aria-pressed={on}
                      initial={{ opacity: 0, scale: 0.4 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 20) * 0.02 + Math.floor(i / 20) * 0.03, type: 'spring', stiffness: 260, damping: 18 }}
                      whileTap={s === 'available' ? { scale: 0.85 } : undefined}
                      aria-label={`Boleto ${n}, ${on ? 'seleccionado' : s === 'available' ? 'disponible' : s === 'paid' ? 'pagado' : 'reservado'}`}
                      className={`relative aspect-square rounded-xl text-sm transition-[background-color,box-shadow,transform] duration-200 sm:text-base ${on ? SELECTED : STYLE[s]}`}
                    >
                      {n}
                      {on && <CheckLg className="absolute -right-1 -top-1 size-4 rounded-full bg-lime p-0.5 text-bark" />}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

      <AnimatePresence>
        {stillFree.length > 0 && !order && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="card mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 bg-sun p-3 sm:p-4">
              <div className="min-w-0">
                <div className="font-display text-2xl text-bark sm:text-3xl">
                  {stillFree.map((n) => `#${n}`).join(' y ')}
                </div>
                <div className="text-sm text-bark/80">
                  {stillFree.length === TICKETS.promo.qty
                    ? `Promo ${TICKETS.promo.qty}x$${TICKETS.promo.price}`
                    : limitHit
                      ? `Máximo ${TICKETS.maxPerOrder} boletos por registro`
                      : `Agrega otro y llévate ${TICKETS.promo.qty} por $${TICKETS.promo.price}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPicked([])}
                  aria-label="Quitar selección"
                  className="grid size-11 place-items-center rounded-full bg-cream text-bark transition hover:bg-sand"
                >
                  <XLg className="size-4" />
                </button>
                <button type="button" onClick={() => setOrder(stillFree)} className="btn bg-orange !py-2.5 text-cream">
                  Apartar · ${orderTotal(stillFree.length)}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {order && (
        <ReserveModal
          numbers={order}
          onClose={() => setOrder(null)}
          onReserved={(ns) => {
            ns.forEach((n) => markLocal(n, 'reserved'))
            setPicked([])
          }}
          online={online}
        />
      )}
    </section>
  )
}
