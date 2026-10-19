import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { EVENT, TICKETS } from '../config'
import { SplitText } from '../components/ui/SplitText'
import { Countdown } from '../components/ui/Countdown'
import { Magnet } from '../components/ui/Magnet'
import { Leaves } from '../components/ui/Leaves'
import { ArrowRight, CalendarHeartFill, TicketPerforatedFill } from 'react-bootstrap-icons'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.25])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const logoX = useTransform(sx, (v) => v * 18)
  const logoY = useTransform(sy, (v) => v * 18)
  const farX = useTransform(sx, (v) => v * -30)
  const farY = useTransform(sy, (v) => v * -20)

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5)
        my.set(e.clientY / window.innerHeight - 0.5)
      }}
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <motion.img
        src="/media/fondo_haven_pagina.webp"
        alt=""
        style={{ y: bgY, scale: bgScale, x: farX }}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bark/30 via-transparent to-cream" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,248,230,.55),transparent_60%)]" />

      <motion.img
        src="/media/alguna_esquina.webp"
        alt=""
        style={{ x: farX, y: farY }}
        className="animate-sway pointer-events-none absolute -left-6 -top-4 w-44 sm:w-72"
      />
      <motion.img
        src="/media/alguna_esquina.webp"
        alt=""
        style={{ x: farX, y: farY }}
        className="pointer-events-none absolute -right-6 -top-4 w-40 -scale-x-100 sm:w-64"
      />

      <Leaves />

      <motion.div
        style={{ y: contentY, opacity: fade }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-44 pt-28 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.3 }}
          className="rounded-full bg-cream/80 px-5 py-2 text-lg text-bark shadow-lg backdrop-blur"
        >
          <span className="inline-flex items-center gap-2">
            <CalendarHeartFill className="size-4 text-orange" /> {EVENT.dates} · Monterrey
          </span>
        </motion.span>

        <motion.div style={{ x: logoX, y: logoY }} className="relative mt-4">
          <div className="absolute inset-[8%] -z-10 rounded-full bg-cream/80 blur-3xl" />
          <motion.img
            src="/media/logo_haven.webp"
            alt="Hack Club Haven"
            initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.4 }}
            className="animate-float w-[min(88vw,560px)] drop-shadow-[0_20px_30px_rgba(120,61,43,.45)]"
          />
        </motion.div>

        <h1 className="-mt-2 font-display text-6xl leading-none text-cream [text-shadow:0_4px_0_#783d2b,0_10px_30px_rgba(120,61,43,.5)] sm:text-8xl">
          <SplitText text="Monterrey" delay={1} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-4 max-w-xl text-xl text-bark sm:text-2xl"
        >
          Un fin de semana para construir, aprender y crear en comunidad.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 1.7 }}
          className="mt-8"
        >
          <Countdown to={EVENT.start} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
          className="mt-10 flex flex-wrap justify-center gap-5"
        >
          <Magnet>
            <a href="#boletos" className="btn bg-orange text-cream">
              <TicketPerforatedFill className="size-5" /> Reserva tu boleto · ${TICKETS.price}
            </a>
          </Magnet>
          <Magnet>
            <a href={EVENT.registerUrl} target="_blank" rel="noreferrer" className="btn bg-lime text-bark">
              Regístrate al evento <ArrowRight className="size-5" />
            </a>
          </Magnet>
        </motion.div>
      </motion.div>

      <motion.img
        src="/media/mascota_haven_2.webp"
        alt="Mascota de Haven"
        initial={{ y: 200, rotate: -20 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 9, delay: 2.2 }}
        whileHover={{ scale: 1.15, rotate: 8 }}
        className="absolute bottom-6 left-2 z-20 w-28 cursor-grab drop-shadow-xl sm:left-10 sm:w-44"
        drag
        dragConstraints={ref}
        dragElastic={0.4}
      />

      <img
        src="/media/espacio_para_el_copy.webp"
        alt=""
        className="pointer-events-none absolute -bottom-1 right-0 z-10 w-[520px] max-w-none sm:w-[680px]"
      />
    </section>
  )
}
