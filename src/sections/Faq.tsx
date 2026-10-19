import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { EVENT, PAYMENT, TICKETS } from '../config'
import { Reveal } from '../components/ui/Reveal'

const QA = [
  ['¿Para qué es el dinero de los boletos?', TICKETS.purpose],
  ['¿Cuánto cuesta?', `$${TICKETS.price} MXN por boleto. Puedes apartar varios números.`],
  ['¿Cómo pago?', `En efectivo con tu punto de venta o por transferencia a la tarjeta ${PAYMENT.card} a nombre de ${PAYMENT.holder}.`],
  ['¿Mi boleto queda confirmado al apartarlo?', 'No. Queda reservado hasta que mandes el mensaje y pagues. Si no se paga, el equipo puede liberar el número.'],
  ['¿Dónde es el sorteo?', 'El sorteo se hace durante el evento, no en esta página.'],
  ['¿Cómo me registro al evento?', `Desde la página oficial de Hack Club: ${EVENT.registerUrl}`],
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="dots px-4 py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <h2 className="font-display text-5xl text-bark sm:text-7xl">Preguntas</h2>
        </Reveal>
        <div className="mt-12 flex flex-col gap-4">
          {QA.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.06}>
              <motion.div layout className={`card overflow-hidden transition-colors ${open === i ? 'bg-sun' : 'bg-cream'}`}>
                <button
                  type="button"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-xl text-bark"
                >
                  {q}
                  <motion.span
                    animate={{ rotate: open === i ? 135 : 0 }}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-orange text-cream"
                  >
                    <Plus className="size-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="break-words px-5 pb-5 text-lg text-bark/85">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
