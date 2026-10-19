import { motion, useMotionValue, useSpring } from 'motion/react'
import type { ReactNode } from 'react'

export function Magnet({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 15 })
  return (
    <motion.div
      className="inline-block"
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
