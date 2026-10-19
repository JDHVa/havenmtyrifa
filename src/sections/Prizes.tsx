import { motion } from 'motion/react'
import { ArrowUpRight, TrophyFill } from 'react-bootstrap-icons'
import { PRIZES, TICKETS } from '../config'
import { Reveal } from '../components/ui/Reveal'
import { TiltCard } from '../components/ui/TiltCard'

const STYLE = [
  { bg: 'from-orange to-rust', text: 'text-cream', span: 'sm:col-span-2 lg:col-span-2 lg:row-span-2', img: 'w-full max-h-80 lg:max-h-none' },
  { bg: 'from-lime to-olive', text: 'text-bark', span: '', img: 'max-h-56' },
  { bg: 'from-sun to-sand', text: 'text-bark', span: '', img: 'max-h-44' },
  { bg: 'from-sand to-rust', text: 'text-cream', span: 'sm:col-span-2 lg:col-span-2', img: 'max-h-56' },
]

export function Prizes() {
  return (
    <section id="premios" className="grain relative overflow-hidden bg-bark px-4 py-28 text-cream">
      <div className="absolute -left-40 top-20 size-96 rounded-full bg-orange/30 blur-3xl" />
      <div className="absolute -right-40 bottom-10 size-96 rounded-full bg-lime/25 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-sun/15 px-4 py-1 text-lg text-sun">
            <TrophyFill className="size-5" /> Rifa Haven MTY
          </span>
          <h2 className="mt-4 font-display text-6xl text-sun sm:text-8xl">Premios</h2>
          <p className="mx-auto mt-4 max-w-xl text-xl text-cream/85">
            {TICKETS.purpose} Con tu boleto entras a la rifa de:
          </p>
        </Reveal>
        <div className="mt-16 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRIZES.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1} className={`h-full ${STYLE[i].span}`}>
              <TiltCard className="h-full">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`group card relative flex h-full flex-col overflow-hidden border-cream/20 bg-gradient-to-br ${STYLE[i].bg} p-6 ${STYLE[i].text}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-bark/80 px-3 py-1 text-sm text-sun">{p.tag}</span>
                    <span className="grid size-10 place-items-center rounded-full bg-cream/90 text-bark transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                  <div className="relative flex flex-1 items-center justify-center py-6">
                    <div className="absolute size-48 rounded-full bg-cream/40 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                    <motion.img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                      className={`relative w-auto max-w-full object-contain drop-shadow-[0_20px_25px_rgba(60,25,10,.45)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${STYLE[i].img}`}
                    />
                  </div>
                  <h3 className="font-display text-3xl leading-tight sm:text-4xl">{p.name}</h3>
                  <p className="mt-1 opacity-90">{p.detail}</p>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <p className="mt-12 text-center text-lg text-cream/70">El sorteo se realiza durante el evento, no en esta página.</p>
      </div>
    </section>
  )
}
