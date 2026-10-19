import { animate, useInView, useMotionValue, useTransform, motion } from 'motion/react'
import { useEffect, useRef } from 'react'

export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: false })
  const value = useMotionValue(0)
  const rounded = useTransform(value, (v) => Math.round(v).toString())
  useEffect(() => {
    if (!inView) return
    const c = animate(value, to, { duration: 1.2, ease: 'easeOut' })
    return () => c.stop()
  }, [inView, to, value])
  return <motion.span ref={ref} className={className}>{rounded}</motion.span>
}
