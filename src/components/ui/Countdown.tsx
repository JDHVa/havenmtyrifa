import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0')

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, target - now)
  const parts = [
    ['días', Math.floor(diff / 86400000)],
    ['horas', Math.floor(diff / 3600000) % 24],
    ['min', Math.floor(diff / 60000) % 60],
    ['seg', Math.floor(diff / 1000) % 60],
  ] as const
  return (
    <div className="flex gap-2 sm:gap-4" aria-label="Cuenta regresiva">
      {parts.map(([label, v], i) => (
        <motion.div
          key={label}
          whileHover={{ y: -6, rotate: i % 2 ? 3 : -3 }}
          className="w-[4.5rem] rounded-3xl border-2 border-cream/80 bg-cream/70 py-3 text-center shadow-[0_12px_30px_-12px_rgba(120,61,43,.6)] backdrop-blur-md sm:w-24"
        >
          <div className="relative h-10 overflow-hidden font-display text-4xl leading-10 text-bark sm:h-12 sm:text-5xl sm:leading-[3rem]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={v}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="block"
              >
                {pad(v)}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-sm text-rust">{label}</div>
        </motion.div>
      ))}
    </div>
  )
}
