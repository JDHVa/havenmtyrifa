import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { CodeSlash, PeopleFill, Stars } from 'react-bootstrap-icons'
import { Reveal } from '../components/ui/Reveal'
import { EVENT } from '../config'

const CARDS = [
  { title: 'Construye', text: 'Crea proyectos reales con otros estudiantes, sin importar tu nivel.', Icon: CodeSlash, color: 'bg-lime', rot: -3 },
  { title: 'Aprende', text: 'Talleres, mentores y mucha comida para mantener la energía arriba.', Icon: Stars, color: 'bg-sun', rot: 2 },
  { title: 'Comparte', text: 'Conoce a la comunidad de Hack Club en Monterrey y presume lo que hiciste.', Icon: PeopleFill, color: 'bg-sand', rot: -2 },
]

export function About() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const imgRot = useTransform(scrollYProgress, [0, 1], [-6, 6])

  return (
    <section id="haven" ref={ref} className="dots relative overflow-hidden px-4 pb-28 pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="rounded-full bg-orange/15 px-4 py-1 text-lg text-rust">¿Qué es Haven?</span>
            <h2 className="mt-4 font-display text-5xl leading-tight text-bark sm:text-7xl">
              Tu lugar para <span className="text-gradient">crear</span>
            </h2>
            <p className="mt-6 max-w-lg text-xl text-bark/85">
              Haven es un evento de Hack Club donde jóvenes se juntan a programar, diseñar y construir durante el {EVENT.dates}. Esta vez llega a{' '}
              <strong className="text-orange">Monterrey</strong>.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {CARDS.map(({ title, text, Icon, color, rot }, i) => (
              <Reveal key={title} delay={0.1 + i * 0.12}>
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: rot }}
                  whileHover={{ rotate: 0, y: -10, scale: 1.05 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className={`card ${color} flex h-full flex-col gap-3 p-5`}
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-cream text-orange shadow-md">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="font-display text-3xl text-bark">{title}</h3>
                  <p className="text-bark/85">{text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
        <motion.div style={{ y: imgY, rotate: imgRot }} className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-6 -z-10 rounded-full bg-gradient-to-br from-sun via-orange to-lime opacity-60 blur-3xl" />
          <motion.img
            src="/media/espacio_para_poner_algo_de_informacion.webp"
            alt="Picnic de amigos de Haven"
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 90, damping: 12 }}
            className="w-full drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
