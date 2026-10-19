import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { ReactNode } from 'react'

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rx = useSpring(useTransform(y, [0, 1], [12, -12]), { stiffness: 200, damping: 15 })
  const ry = useSpring(useTransform(x, [0, 1], [-12, 12]), { stiffness: 200, damping: 15 })
  const glowX = useTransform(x, (v) => `${v * 100}%`)
  const glowY = useTransform(y, (v) => `${v * 100}%`)
  const glow = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,.9), transparent 55%)`
  return (
    <motion.div
      className={`relative [transform-style:preserve-3d] ${className ?? ''}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left) / r.width)
        y.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        x.set(0.5)
        y.set(0.5)
      }}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
        style={{ background: glow }}
      />
    </motion.div>
  )
}
