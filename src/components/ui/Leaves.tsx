import { useMemo } from 'react'
import { motion } from 'motion/react'

const COLORS = ['#fc8616', '#e87136', '#f9dd60', '#b8c11f', '#dfa063']

function Leaf({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden>
      <path d="M12 2C6 6 3 11 4 17c1 3 4 5 8 5 4 0 7-2 8-5 1-6-2-11-8-15Z" fill={color} />
      <path d="M12 5v16" stroke="rgba(120,61,43,.35)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function Leaves({ count = 18 }: { count?: number }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        size: 14 + Math.random() * 18,
        duration: 9 + Math.random() * 9,
        delay: -Math.random() * 18,
        drift: (Math.random() - 0.5) * 220,
        spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
        color: COLORS[i % COLORS.length],
      })),
    [count],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {leaves.map((l, i) => (
        <motion.div
          key={i}
          className="absolute -top-10"
          style={{ left: `${l.left}%`, width: l.size, height: l.size }}
          animate={{ y: ['0vh', '115vh'], x: [0, l.drift / 2, l.drift], rotate: [0, l.spin] }}
          transition={{ duration: l.duration, delay: l.delay, repeat: Infinity, ease: 'linear' }}
        >
          <Leaf color={l.color} />
        </motion.div>
      ))}
    </div>
  )
}
