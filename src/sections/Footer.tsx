import { motion } from 'motion/react'
import { EVENT, TICKETS } from '../config'
import { Leaves } from '../components/ui/Leaves'

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-bark px-4 pb-14 pt-24 text-cream">
      <Leaves count={10} />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <motion.img
          src="/media/logo_haven.webp"
          alt="Hack Club Haven"
          initial={{ scale: 0.7, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 120, damping: 10 }}
          className="w-72 animate-float"
        />
        <p className="font-display text-6xl text-sun sm:text-8xl">¡Nos vemos ahí!</p>
        <p className="text-xl">{EVENT.dates} · Monterrey</p>
        <a href={EVENT.registerUrl} target="_blank" rel="noreferrer" className="btn bg-orange text-cream">
          Regístrate al evento →
        </a>
        <p className="max-w-md text-cream/70">{TICKETS.purpose}</p>
        <p className="text-sm text-cream/50">Hecho con 🧡 por el equipo de Haven MTY</p>
      </div>
    </footer>
  )
}
