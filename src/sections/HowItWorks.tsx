import { motion } from 'motion/react'
import { CursorFill, Wallet2, Whatsapp } from 'react-bootstrap-icons'
import { Reveal } from '../components/ui/Reveal'
import { SALE_POINTS } from '../config'

const STEPS = [
  { title: 'Elige tu número', text: 'Escoge un boleto libre del 1 al 200. Se bloquea al instante para todos.', Icon: CursorFill },
  { title: 'Manda el mensaje', text: 'Se abre WhatsApp con tu nombre, folio, hora y procedencia. Envíalo a tu punto de venta.', Icon: Whatsapp },
  { title: 'Paga', text: 'En efectivo o por transferencia. El equipo marca tu boleto como pagado.', Icon: Wallet2 },
]

const formatPhone = (p: string) => `+${p.replace(/^(\d{2})(\d)(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3 $4 $5')}`

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-lime px-4 py-28">
      <div className="absolute -right-24 top-10 size-80 rounded-full bg-sun/50 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="font-display text-5xl text-bark sm:text-7xl">¿Cómo funciona?</h2>
        </Reveal>
        <div className="relative mt-16 grid gap-10 md:grid-cols-3">
          <svg className="pointer-events-none absolute left-0 top-10 hidden h-10 w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden>
            <motion.path
              d="M5 5 Q 27 -3 50 5 T 95 5"
              fill="none"
              stroke="#783d2b"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />
          </svg>
          {STEPS.map(({ title, text, Icon }, i) => (
            <Reveal key={title} delay={i * 0.18}>
              <motion.div whileHover={{ y: -8 }} className="card relative h-full bg-cream p-7 pt-14 text-center">
                <motion.span
                  initial={{ scale: 0, rotate: -90 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.2 + i * 0.18 }}
                  className="absolute -top-8 left-1/2 grid size-16 -translate-x-1/2 place-items-center rounded-full bg-orange text-cream shadow-lg ring-8 ring-lime"
                >
                  <Icon className="size-7" />
                </motion.span>
                <span className="font-display text-xl text-rust">Paso {i + 1}</span>
                <h3 className="font-display text-4xl text-bark">{title}</h3>
                <p className="mt-3 text-lg text-bark/80">{text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <div className="mt-24 grid items-center gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <img src="/media/mas_imagenes.webp" alt="Huerto de Haven" className="animate-float mx-auto w-full max-w-sm drop-shadow-2xl" />
          </Reveal>
          <div>
            <Reveal>
              <h3 className="font-display text-5xl text-bark sm:text-6xl">Puntos de venta</h3>
              <p className="mt-2 text-lg text-bark/80">Escríbele directo a quien te quede más cerca.</p>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {SALE_POINTS.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <motion.a
                    href={`https://wa.me/${p.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.04, rotate: i % 2 ? 1.5 : -1.5 }}
                    className="card group flex h-full items-center gap-4 bg-cream p-5"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun font-display text-2xl text-bark transition-colors group-hover:bg-orange group-hover:text-cream">
                      {p.contact[0]}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-2xl leading-tight text-bark">{p.label}</span>
                      <span className="block text-rust">{p.contact}</span>
                      <span className="block text-sm text-bark/70">{formatPhone(p.phone)}</span>
                    </span>
                  </motion.a>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
